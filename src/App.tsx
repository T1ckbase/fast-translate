import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'hono/jsx';
// import { useEffect, useRef, useState } from 'preact/compat';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import { useDebounce } from './hooks/use-debounce';
import { useSaveToLocalStorage } from './hooks/use-save-to-local-storage';
import { type GoogleLanguage, googleLanguages, isGoogleLanguage, translate } from './lib/google-translate';

const sl = localStorage.getItem('source-language');
const tl = localStorage.getItem('target-language');

const fetcher = async ([sourceLanguage, targetLanguage, text]: [GoogleLanguage, GoogleLanguage, string]) => {
  return translate(sourceLanguage, targetLanguage, text);
};

export function App() {
  const [sourceLanguage, setSourceLanguage] = useState(isGoogleLanguage(sl) ? sl : 'auto');
  const [targetLanguage, setTargetLanguage] = useState(isGoogleLanguage(tl) ? tl : 'en');
  const [text, setText] = useState(localStorage.getItem('text') ?? '');
  const debouncedText = useDebounce(text, 500);

  const sourceTextareaRef = useRef<HTMLTextAreaElement>(null);
  const targetTextareaRef = useRef<HTMLTextAreaElement>(null);
  const detectedLanguageRef = useRef<HTMLSpanElement>(null);

  useSaveToLocalStorage('source-language', sourceLanguage);
  useSaveToLocalStorage('target-language', targetLanguage);
  useSaveToLocalStorage('text', debouncedText);

  const queryClient = useQueryClient();

  const handleSourceLanguageChange = (e: Event) => {
    const { value } = e.currentTarget as HTMLSelectElement;
    setSourceLanguage(value as GoogleLanguage);
  };

  const handleTargetLanguageChange = (e: Event) => {
    const { value } = e.currentTarget as HTMLSelectElement;
    setTargetLanguage(value as GoogleLanguage);
  };

  const handleTextInput = (e: Event) => {
    const { value } = e.currentTarget as HTMLTextAreaElement;
    setText(value);
    queryClient.cancelQueries({ queryKey: ['translate'] });
  };

  const handleSwapLanguageClick = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage === 'auto' ? (data ? data.sourceLanguage : 'en') : sourceLanguage);
    if (targetTextareaRef.current) {
      setText(targetTextareaRef.current.value);
      targetTextareaRef.current.value = text;
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

  // const { data, error, isLoading } = useSWR(debouncedText ? [sourceLanguage, targetLanguage, debouncedText] : null, fetcher, {
  //   // dedupingInterval: Infinity,
  //   // keepPreviousData: true,
  // });

  const { data, error } = useQuery({
    queryKey: ['translate', debouncedText, sourceLanguage, targetLanguage],
    queryFn: async ({ signal }) => {
      if (!debouncedText.trim()) return;
      try {
        return await translate(sourceLanguage, targetLanguage, debouncedText, signal);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // Ignore abort errors
          return;
        }
        throw error;
      }
    },
    enabled: Boolean(debouncedText.trim()),
    staleTime: 600000,
    gcTime: 600000,
  });

  console.log({ sourceLanguage, targetLanguage, debouncedText });
  console.log(targetTextareaRef.current, data);
  // if (targetTextareaRef.current && data) {
  //   targetTextareaRef.current.value = data.translation;
  //   // setTranslated(data.translation);
  // }

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
            <select id='source-language' value={sourceLanguage} onChange={handleSourceLanguageChange}>
              {useMemo(
                () =>
                  Object.entries(googleLanguages).map(([value, label]) => (
                    <option value={value} selected={sourceLanguage === value}>
                      {label}
                    </option>
                  )),
                [],
              )}
            </select>
          </div>
          <div>
            <button type='button' id='swap-languages' title='Swap languages' onClick={handleSwapLanguageClick}>
              ⇄
            </button>
          </div>
          <div>
            <select id='target-language' value={targetLanguage} onChange={handleTargetLanguageChange}>
              {useMemo(
                () =>
                  Object.entries(googleLanguages)
                    .filter(([lang]) => lang !== 'auto')
                    .map(([value, label]) => (
                      <option value={value} selected={targetLanguage === value}>
                        {label}
                      </option>
                    )),
                [],
              )}
            </select>
          </div>
        </div>
        <div class='translation-panels'>
          <div class='panel'>
            <div class='panel__toolbar'>
              <span ref={detectedLanguageRef} id='detected-language'>
                {data && sourceLanguage === 'auto'
                  ? `Detected: ${googleLanguages[data.sourceLanguage] ?? data.sourceLanguage}`
                  : detectedLanguageRef.current
                    ? detectedLanguageRef.current.innerText
                    : ''}
              </span>
              <button
                type='button'
                id='copy-source'
                class='copy-button'
                onClick={() => sourceTextareaRef.current && navigator.clipboard.writeText(sourceTextareaRef.current.value)}
              >
                <span>Copy</span>
                <span>Copied</span>
              </button>
            </div>
            <textarea
              ref={sourceTextareaRef}
              id='source-textarea'
              placeholder='Type to translate'
              autocomplete='off'
              value={text}
              onInput={handleTextInput}
              onScroll={handleTextAreaScroll}
            ></textarea>
          </div>
          <div class='panel'>
            <div class='panel__toolbar'>
              <span id='status'>{error instanceof Error ? error.message : error}</span>
              <button
                type='button'
                id='copy-target'
                onClick={() => targetTextareaRef.current && navigator.clipboard.writeText(targetTextareaRef.current.value)}
              >
                <span>Copy</span>
                <span>Copied</span>
              </button>
            </div>
            <textarea
              ref={targetTextareaRef}
              value={data ? data.translation : targetTextareaRef.current ? targetTextareaRef.current.value : ''}
              onScroll={handleTextAreaScroll}
              id='target-textarea'
              readonly={true}
              placeholder='Translation'
              autocomplete='off'
            ></textarea>
          </div>
        </div>
      </main>
    </>
  );
}
