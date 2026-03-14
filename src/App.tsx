import { useQuery, useQueryClient } from '@tanstack/preact-query';
import { useMemo, useRef, useState } from 'preact/hooks';
import { useDebounce } from './hooks/use-debounce';
import { useSaveToLocalStorage } from './hooks/use-save-to-local-storage';
import { type GoogleLanguage, googleLanguages, isGoogleLanguage, translate } from './lib/google-translate';

const sl = localStorage.getItem('source-language');
const tl = localStorage.getItem('target-language');

export default function App() {
  const [sourceLanguage, setSourceLanguage] = useState<GoogleLanguage>(isGoogleLanguage(sl) ? sl : 'auto');
  const [targetLanguage, setTargetLanguage] = useState<GoogleLanguage>(isGoogleLanguage(tl) ? tl : 'en');
  const [text, setText] = useState(localStorage.getItem('text') ?? '');
  const debouncedText = useDebounce(text, 500);

  const sourceTextareaRef = useRef<HTMLTextAreaElement>(null);
  const targetTextareaRef = useRef<HTMLTextAreaElement>(null);

  useSaveToLocalStorage('source-language', sourceLanguage);
  useSaveToLocalStorage('target-language', targetLanguage);
  useSaveToLocalStorage('text', debouncedText);

  const queryClient = useQueryClient();
  const languageOptions = useMemo(() => Object.entries(googleLanguages), []);
  const targetLanguageOptions = useMemo(() => languageOptions.filter(([lang]) => lang !== 'auto'), [languageOptions]);

  const query = useQuery({
    queryKey: ['translate', debouncedText, sourceLanguage, targetLanguage],
    queryFn: async ({ signal }) => {
      if (debouncedText.trim().length === 0) return null;

      try {
        return await translate(sourceLanguage, targetLanguage, debouncedText, signal);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return null;
        }

        throw error;
      }
    },
    enabled: debouncedText.trim().length > 0,
    refetchOnWindowFocus: false,
    staleTime: 600000,
    gcTime: 600000,
  });

  const translation = query.data ?? null;

  const handleSwapLanguageClick = () => {
    const nextSourceLanguage = targetLanguage;
    const nextTargetLanguage = sourceLanguage === 'auto' ? (translation?.sourceLanguage ?? 'en') : sourceLanguage;

    setSourceLanguage(nextSourceLanguage);
    setTargetLanguage(nextTargetLanguage);

    if (targetTextareaRef.current) {
      setText(targetTextareaRef.current.value);
    }
  };

  const handleTextAreaScroll = (e: Event) => {
    const source = sourceTextareaRef.current;
    const target = targetTextareaRef.current;
    if (!source || !target) return;

    const isSourceScrolling = e.currentTarget === source;
    const scrolling = isSourceScrolling ? source : target;
    const other = isSourceScrolling ? target : source;

    const percentage = scrolling.scrollTop / (scrolling.scrollHeight - scrolling.clientHeight);
    const otherScrollTop = percentage * (other.scrollHeight - other.clientHeight);
    other.scrollTop = otherScrollTop;
  };

  const detectedLanguageLabel =
    sourceLanguage !== 'auto' || !translation ? '' : `Detected: ${googleLanguages[translation.sourceLanguage] ?? translation.sourceLanguage}`;

  const targetText = translation?.translation ?? '';
  const statusMessage = !query.error ? '' : query.error instanceof Error ? query.error.message : String(query.error);

  const copySourceText = async () => {
    if (sourceTextareaRef.current) {
      await navigator.clipboard.writeText(sourceTextareaRef.current.value);
    }
  };

  const copyTargetText = async () => {
    if (targetTextareaRef.current) {
      await navigator.clipboard.writeText(targetTextareaRef.current.value);
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
            <select aria-label='Source language' value={sourceLanguage} onChange={(e) => setSourceLanguage(e.currentTarget.value as GoogleLanguage)}>
              {languageOptions.map(([value, label]) => (
                <option value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <button type='button' id='swap-languages' title='Swap languages' onClick={handleSwapLanguageClick}>
              ⇄
            </button>
          </div>
          <div>
            <select aria-label='Target language' value={targetLanguage} onChange={(e) => setTargetLanguage(e.currentTarget.value as GoogleLanguage)}>
              {targetLanguageOptions.map(([value, label]) => (
                <option value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <div class='translation-panels'>
          <div class='panel'>
            <div class='panel__toolbar'>
              <span id='detected-language'>{detectedLanguageLabel}</span>
              <button type='button' class='copy-button' onClick={copySourceText}>
                <span>Copy</span>
                <span>Copied</span>
              </button>
            </div>
            <textarea
              ref={sourceTextareaRef}
              id='source-textarea'
              placeholder='Type to translate'
              autocomplete='off'
              autofocus
              value={text}
              onInput={(e) => {
                setText(e.currentTarget.value);
                queryClient.cancelQueries({ queryKey: ['translate'] });
              }}
              onScroll={handleTextAreaScroll}
            />
          </div>
          <div class='panel'>
            <div class='panel__toolbar'>
              <span id='status'>{statusMessage}</span>
              <button type='button' class='copy-button' onClick={copyTargetText}>
                <span>Copy</span>
                <span>Copied</span>
              </button>
            </div>
            <textarea
              ref={targetTextareaRef}
              value={targetText}
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
