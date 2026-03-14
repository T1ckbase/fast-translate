import { type GoogleLanguage, googleLanguages, isGoogleLanguage, translate } from './lib/google-translate';

type TranslationState = {
  translation: string;
  sourceLanguage: GoogleLanguage;
};

const STORAGE_KEYS = {
  sourceLanguage: 'source-language',
  targetLanguage: 'target-language',
  text: 'text',
} as const;

const sourceLanguageSelect = getElement<HTMLSelectElement>('source-language');
const targetLanguageSelect = getElement<HTMLSelectElement>('target-language');
const swapLanguagesButton = getElement<HTMLButtonElement>('swap-languages');
const sourceTextarea = getElement<HTMLTextAreaElement>('source-text');
const targetTextarea = getElement<HTMLTextAreaElement>('target-text');
const detectedLanguageElement = getElement<HTMLSpanElement>('detected-language');
const statusElement = getElement<HTMLSpanElement>('translation-status');
const copySourceButton = getElement<HTMLButtonElement>('copy-source-text');
const copyTargetButton = getElement<HTMLButtonElement>('copy-target-text');

const storedSourceLanguage = getStoredValue(STORAGE_KEYS.sourceLanguage);
const storedTargetLanguage = getStoredValue(STORAGE_KEYS.targetLanguage);

let sourceLanguage: GoogleLanguage = isGoogleLanguage(storedSourceLanguage) ? storedSourceLanguage : 'auto';
let targetLanguage: GoogleLanguage = isGoogleLanguage(storedTargetLanguage) ? storedTargetLanguage : 'en';
let currentText = getStoredValue(STORAGE_KEYS.text) ?? '';
let translationState: TranslationState | null = null;
let syncScrollLock = false;
let debounceTimer: number | null = null;
let activeRequestController: AbortController | null = null;

const translationCache = new Map<string, TranslationState>();

populateLanguageOptions(sourceLanguageSelect, Object.entries(googleLanguages), sourceLanguage);
populateLanguageOptions(
  targetLanguageSelect,
  Object.entries(googleLanguages).filter(([language]) => language !== 'auto'),
  targetLanguage,
);

sourceTextarea.value = currentText;

sourceLanguageSelect.addEventListener('change', () => {
  sourceLanguage = sourceLanguageSelect.value as GoogleLanguage;
  setStoredValue(STORAGE_KEYS.sourceLanguage, sourceLanguage);
  requestTranslation();
});

targetLanguageSelect.addEventListener('change', () => {
  targetLanguage = targetLanguageSelect.value as GoogleLanguage;
  setStoredValue(STORAGE_KEYS.targetLanguage, targetLanguage);
  requestTranslation();
});

sourceTextarea.addEventListener('input', () => {
  currentText = sourceTextarea.value;
  setStoredValue(STORAGE_KEYS.text, currentText);
  cancelActiveRequest();
  scheduleTranslation();
});

sourceTextarea.addEventListener('scroll', () => syncScroll(sourceTextarea, targetTextarea));
targetTextarea.addEventListener('scroll', () => syncScroll(targetTextarea, sourceTextarea));

swapLanguagesButton.addEventListener('click', () => {
  const nextSourceLanguage = targetLanguage;
  const nextTargetLanguage = sourceLanguage === 'auto' ? (translationState?.sourceLanguage ?? 'en') : sourceLanguage;

  sourceLanguage = nextSourceLanguage;
  targetLanguage = nextTargetLanguage;
  sourceLanguageSelect.value = sourceLanguage;
  targetLanguageSelect.value = targetLanguage;

  currentText = targetTextarea.value;
  sourceTextarea.value = currentText;

  setStoredValue(STORAGE_KEYS.sourceLanguage, sourceLanguage);
  setStoredValue(STORAGE_KEYS.targetLanguage, targetLanguage);
  setStoredValue(STORAGE_KEYS.text, currentText);

  requestTranslation();
});

copySourceButton.addEventListener('click', async () => {
  await copyText(sourceTextarea.value, 'Failed to copy source text');
});

copyTargetButton.addEventListener('click', async () => {
  await copyText(targetTextarea.value, 'Failed to copy translated text');
});

requestTranslation();

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);

  if (!(element instanceof HTMLElement)) {
    throw new Error(`Expected element with id "${id}"`);
  }

  return element as T;
}

function populateLanguageOptions(
  select: HTMLSelectElement,
  options: Array<[string, string]>,
  selectedValue: GoogleLanguage,
) {
  const fragment = document.createDocumentFragment();

  for (const [value, label] of options) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    option.selected = value === selectedValue;
    fragment.append(option);
  }

  select.replaceChildren(fragment);
}

function getStoredValue(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    setStatus(`Failed to read saved setting: ${key}`);
    return null;
  }
}

function setStoredValue(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    setStatus(`Failed to save setting: ${key}`);
  }
}

function setStatus(message: string) {
  statusElement.textContent = message;
}

async function copyText(text: string, errorMessage: string) {
  try {
    await navigator.clipboard.writeText(text);
    setStatus('');
  } catch {
    setStatus(errorMessage);
  }
}

function scheduleTranslation() {
  if (debounceTimer !== null) {
    window.clearTimeout(debounceTimer);
  }

  debounceTimer = window.setTimeout(() => {
    requestTranslation();
  }, 500);
}

async function requestTranslation() {
  if (debounceTimer !== null) {
    window.clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  const text = currentText;

  if (text.trim().length === 0) {
    cancelActiveRequest();
    translationState = null;
    targetTextarea.value = '';
    detectedLanguageElement.textContent = '';
    setStatus('');
    return;
  }

  cancelActiveRequest();

  const cacheKey = JSON.stringify([sourceLanguage, targetLanguage, text]);
  const cachedTranslation = translationCache.get(cacheKey);

  if (cachedTranslation) {
    applyTranslation(cachedTranslation);
    setStatus('');
    return;
  }

  const requestController = new AbortController();
  activeRequestController = requestController;

  try {
    const result = await translate(sourceLanguage, targetLanguage, text, requestController.signal);

    if (activeRequestController !== requestController) {
      return;
    }

    const nextState = {
      translation: result.translation,
      sourceLanguage: result.sourceLanguage,
    } satisfies TranslationState;

    translationCache.set(cacheKey, nextState);
    applyTranslation(nextState);
    setStatus('');
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return;
    }

    if (activeRequestController !== requestController) {
      return;
    }

    translationState = null;
    targetTextarea.value = '';
    detectedLanguageElement.textContent = '';
    setStatus(error instanceof Error ? error.message : String(error));
  } finally {
    if (activeRequestController === requestController) {
      activeRequestController = null;
    }
  }
}

function applyTranslation(nextState: TranslationState) {
  translationState = nextState;
  targetTextarea.value = nextState.translation;
  detectedLanguageElement.textContent =
    sourceLanguage === 'auto'
      ? `Detected: ${googleLanguages[nextState.sourceLanguage] ?? nextState.sourceLanguage}`
      : '';
  syncScrollToFocusedTextarea();
}

function cancelActiveRequest() {
  activeRequestController?.abort();
  activeRequestController = null;
}

function syncScroll(scrolling: HTMLTextAreaElement, other: HTMLTextAreaElement) {
  if (syncScrollLock) {
    return;
  }

  const scrollingRange = scrolling.scrollHeight - scrolling.clientHeight;
  const otherRange = other.scrollHeight - other.clientHeight;
  const percentage = scrollingRange <= 0 ? 0 : scrolling.scrollTop / scrollingRange;

  syncScrollLock = true;
  other.scrollTop = percentage * otherRange;
  syncScrollLock = false;
}

function syncScrollToFocusedTextarea() {
  if (document.activeElement === targetTextarea) {
    syncScroll(targetTextarea, sourceTextarea);
    return;
  }

  syncScroll(sourceTextarea, targetTextarea);
}
