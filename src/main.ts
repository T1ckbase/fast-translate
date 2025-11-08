import { batch, effect, signal } from '@preact/signals-core';
import { QueryClient } from '@tanstack/query-core';
import { type GoogleLanguage, googleLanguages, isGoogleLanguage, type TranslationResult, translate } from './lib/google-translate';
import { debounceSignal } from './utils/debounce-signal';
import { localStorageSignal } from './utils/local-storage-signal';

const sourceLanguageSelect = document.querySelector<HTMLSelectElement>('#source-language')!;
const targetLanguageSelect = document.querySelector<HTMLSelectElement>('#target-language')!;
const swapLanguagesButton = document.querySelector<HTMLSelectElement>('#swap-languages')!;

const detectedLanguageSpan = document.querySelector<HTMLSpanElement>('#detected-language')!;
const statusSpan = document.querySelector<HTMLSpanElement>('#status')!;
const sourceTextarea = document.querySelector<HTMLTextAreaElement>('#source-textarea')!;
const targetTextarea = document.querySelector<HTMLTextAreaElement>('#target-textarea')!;

const fragment1 = document.createDocumentFragment();
const fragment2 = document.createDocumentFragment();
for (const [value, label] of Object.entries(googleLanguages)) {
  if (value === 'auto') continue;
  fragment1.appendChild(new Option(label, value));
  fragment2.appendChild(new Option(label, value));
}
sourceLanguageSelect.appendChild(fragment1);
targetLanguageSelect.appendChild(fragment2);

const sl = localStorage.getItem('sl');
const tl = localStorage.getItem('tl');

const sourceLanguage = localStorageSignal(signal(isGoogleLanguage(sl) ? sl : 'auto'), 'sl');
const targetLanguage = localStorageSignal(signal(isGoogleLanguage(tl) ? tl : 'en'), 'tl');
const sourceText = signal(localStorage.getItem('text') || '');
const debouncedSourceText = localStorageSignal(debounceSignal(sourceText, 500), 'text');
const translationResult = signal<TranslationResult | null>(null);
let start = performance.now();

sourceLanguageSelect.value = sourceLanguage.value;
targetLanguageSelect.value = targetLanguage.value;
sourceTextarea.value = sourceText.value;

const queryClient = new QueryClient();

// effect(() => {
//   localStorage.setItem('sl', sourceLanguage.value);
// });

// effect(() => {
//   localStorage.setItem('tl', targetLanguage.value);
// });

effect(() => {
  start = performance.now();
  queryClient
    .fetchQuery({
      queryKey: ['translate', sourceLanguage.value, targetLanguage.value, debouncedSourceText.value],
      queryFn: async ({ signal }) => {
        if (!debouncedSourceText.value.trim()) return null;
        try {
          const data = await translate(sourceLanguage.value, targetLanguage.value, debouncedSourceText.value, signal);

          return data;
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            // Ignore abort errors
            return null;
          }
          throw error;
        }
      },
      staleTime: 60000,
      gcTime: 60000,
      retryDelay: 3000,
    })
    .then((data) => {
      translationResult.value = data;
    })
    .catch((error) => {
      statusSpan.innerText = error instanceof Error ? error.message : error;
    });
});

effect(() => {
  const data = translationResult.value;
  if (!data) {
    detectedLanguageSpan.innerText = '';
    return;
  }
  detectedLanguageSpan.innerText = sourceLanguage.value === 'auto' ? `Detected language: ${googleLanguages[data.sourceLanguage] ?? data.sourceLanguage}` : '';
  statusSpan.innerText = `Translated in ${Math.round(performance.now() - start)} ms`;
  targetTextarea.value = data.translation;
});

sourceLanguageSelect.addEventListener('change', (event) => {
  const target = event.target;
  if (target) {
    const value = (target as HTMLSelectElement).value;
    sourceLanguage.value = value as GoogleLanguage;
  }
});

targetLanguageSelect.addEventListener('change', (event) => {
  const target = event.target;
  if (target) {
    const value = (target as HTMLSelectElement).value;
    targetLanguage.value = value as GoogleLanguage;
  }
});

swapLanguagesButton.addEventListener('click', () => {
  batch(() => {
    const temp = sourceLanguage.value;
    sourceLanguage.value = targetLanguage.value;
    targetLanguage.value = temp === 'auto' ? (translationResult.value?.sourceLanguage ?? 'en') : temp;
    sourceLanguageSelect.value = sourceLanguage.value;
    targetLanguageSelect.value = targetLanguage.value;
    sourceTextarea.value = targetTextarea.value;
  });
});

sourceTextarea.addEventListener('input', (event) => {
  const target = event.target;
  if (target) {
    const value = (target as HTMLTextAreaElement).value;
    sourceText.value = value;
  }
});

sourceTextarea.focus();
