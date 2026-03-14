import { useQuery, useQueryClient } from '@tanstack/solid-query';
import { createMemo, createSignal, For } from 'solid-js';
import { useDebounce } from './hooks/use-debounce';
import { useSaveToLocalStorage } from './hooks/use-save-to-local-storage';
import { type GoogleLanguage, googleLanguages, isGoogleLanguage, translate } from './lib/google-translate';

const sl = localStorage.getItem('source-language');
const tl = localStorage.getItem('target-language');

export function App() {
  const [sourceLanguage, setSourceLanguage] = createSignal<GoogleLanguage>(isGoogleLanguage(sl) ? sl : 'auto');
  const [targetLanguage, setTargetLanguage] = createSignal<GoogleLanguage>(isGoogleLanguage(tl) ? tl : 'en');
  const [text, setText] = createSignal(localStorage.getItem('text') ?? '');
  const debouncedText = useDebounce(text, 500);

  let sourceTextareaRef: HTMLTextAreaElement | undefined;
  let targetTextareaRef: HTMLTextAreaElement | undefined;

  useSaveToLocalStorage('source-language', sourceLanguage);
  useSaveToLocalStorage('target-language', targetLanguage);
  useSaveToLocalStorage('text', debouncedText);

  const queryClient = useQueryClient();
  const languageOptions = createMemo(() => Object.entries(googleLanguages));
  const targetLanguageOptions = createMemo(() => languageOptions().filter(([lang]) => lang !== 'auto'));

  const handleSourceLanguageChange = (e: Event) => {
    const { value } = e.currentTarget as HTMLSelectElement;
    setSourceLanguage(value as GoogleLanguage);
  };

  const handleTargetLanguageChange = (e: Event) => {
    const { value } = e.currentTarget as HTMLSelectElement;
    setTargetLanguage(value as GoogleLanguage);
  };

  const handleTextInput = (e: InputEvent) => {
    const { value } = e.currentTarget as HTMLTextAreaElement;
    setText(value);
    queryClient.cancelQueries({ queryKey: ['translate'] });
  };

  const query = useQuery(() => ({
    queryKey: ['translate', debouncedText(), sourceLanguage(), targetLanguage()],
    queryFn: async ({ signal }) => {
      if (debouncedText().trim().length === 0) return null;

      try {
        return await translate(sourceLanguage(), targetLanguage(), debouncedText(), signal);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return null;
        }

        throw error;
      }
    },
    enabled: debouncedText().trim().length > 0,
    refetchOnWindowFocus: false,
    staleTime: 600000,
    gcTime: 600000,
  }));

  const translation = createMemo(() => query.data ?? null);

  const handleSwapLanguageClick = () => {
    const nextSourceLanguage = targetLanguage();
    const nextTargetLanguage = sourceLanguage() === 'auto' ? (translation()?.sourceLanguage ?? 'en') : sourceLanguage();

    setSourceLanguage(nextSourceLanguage);
    setTargetLanguage(nextTargetLanguage);

    if (targetTextareaRef) {
      setText(targetTextareaRef.value);
    }
  };

  const handleTextAreaScroll = (e: Event) => {
    const source = sourceTextareaRef;
    const target = targetTextareaRef;
    if (!source || !target) return;

    const isSourceScrolling = e.currentTarget === source;
    const scrolling = isSourceScrolling ? source : target;
    const other = isSourceScrolling ? target : source;

    const percentage = scrolling.scrollTop / (scrolling.scrollHeight - scrolling.clientHeight);
    const otherScrollTop = percentage * (other.scrollHeight - other.clientHeight);
    other.scrollTop = otherScrollTop;
  };

  const detectedLanguageLabel = createMemo(() => {
    const result = translation();

    if (sourceLanguage() !== 'auto' || !result) {
      return '';
    }

    return `Detected: ${googleLanguages[result.sourceLanguage] ?? result.sourceLanguage}`;
  });

  const targetText = createMemo(() => translation()?.translation ?? '');
  const statusMessage = createMemo(() => {
    if (!query.error) return '';
    return query.error instanceof Error ? query.error.message : String(query.error);
  });

  const copySourceText = async () => {
    if (sourceTextareaRef) {
      await navigator.clipboard.writeText(sourceTextareaRef.value);
    }
  };

  const copyTargetText = async () => {
    if (targetTextareaRef) {
      await navigator.clipboard.writeText(targetTextareaRef.value);
    }
  };

  return (
    <>
      <header>
        <nav>
          <a href='https://github.com/T1ckbase/fast-translate'>Fast Translate</a>
        </nav>
      </header>
      <main>
        <div class='language-controls'>
          <div>
            <select aria-label='Source language' value={sourceLanguage()} onChange={handleSourceLanguageChange}>
              <For each={languageOptions()}>{([value, label]) => <option value={value}>{label}</option>}</For>
            </select>
          </div>
          <div>
            <button type='button' id='swap-languages' title='Swap languages' onClick={handleSwapLanguageClick}>
              ⇄
            </button>
          </div>
          <div>
            <select aria-label='Target language' value={targetLanguage()} onChange={handleTargetLanguageChange}>
              <For each={targetLanguageOptions()}>{([value, label]) => <option value={value}>{label}</option>}</For>
            </select>
          </div>
        </div>
        <div class='translation-panels'>
          <div class='panel'>
            <div class='panel__toolbar'>
              <span id='detected-language'>{detectedLanguageLabel()}</span>
              <button type='button' class='copy-button' onClick={copySourceText}>
                <span>Copy</span>
                <span>Copied</span>
              </button>
            </div>
            <textarea
              ref={(element) => {
                sourceTextareaRef = element;
              }}
              id='source-textarea'
              placeholder='Type to translate'
              autocomplete='off'
              autofocus
              value={text()}
              onInput={handleTextInput}
              onScroll={handleTextAreaScroll}
            />
          </div>
          <div class='panel'>
            <div class='panel__toolbar'>
              <span id='status'>{statusMessage()}</span>
              <button type='button' class='copy-button' onClick={copyTargetText}>
                <span>Copy</span>
                <span>Copied</span>
              </button>
            </div>
            <textarea
              ref={(element) => {
                targetTextareaRef = element;
              }}
              value={targetText()}
              onScroll={handleTextAreaScroll}
              id='target-textarea'
              readOnly
              placeholder='Translation'
              autocomplete='off'
            />
          </div>
        </div>
      </main>
    </>
  );
}
