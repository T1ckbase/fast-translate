import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useRef, useState } from 'hono/jsx';
import { DebouncedTextarea } from './components/debounced-textarea';
import { useDebounce } from './hooks/use-debounce';
import { useSaveToLocalStorage } from './hooks/use-save-to-local-storage';
import { type GoogleLanguage, googleLanguages, isGoogleLanguage, translate } from './lib/google-translate';

const sl = localStorage.getItem('source-language');
const tl = localStorage.getItem('target-language');

export function App() {
  const [sourceLanguage, setSourceLanguage] = useState(isGoogleLanguage(sl) ? sl : 'auto');
  const [targetLanguage, setTargetLanguage] = useState(isGoogleLanguage(tl) ? tl : 'en');
  const [text, setText] = useState(localStorage.getItem('text') ?? '');
  // const [debouncedText, setText] = useState(localStorage.getItem('text') ?? '');
  const debouncedText = useDebounce(text, 500);

  const sourceTextareaRef = useRef<HTMLTextAreaElement>(null);
  const targetTextareaRef = useRef<HTMLTextAreaElement>(null);
  const detectedLanguageRef = useRef<HTMLSpanElement>(null);

  useSaveToLocalStorage('source-language', sourceLanguage);
  useSaveToLocalStorage('target-language', targetLanguage);
  useSaveToLocalStorage('text', debouncedText);

  const queryClient = useQueryClient();

  const handleSourceLanguageChange = useCallback((e: Event) => {
    const { value } = e.currentTarget as HTMLSelectElement;
    setSourceLanguage(value as GoogleLanguage);
  }, []);

  const handleTargetLanguageChange = useCallback((e: Event) => {
    const { value } = e.currentTarget as HTMLSelectElement;
    setTargetLanguage(value as GoogleLanguage);
  }, []);

  const handleTextInput = useCallback((e: Event) => {
    const { value } = e.currentTarget as HTMLTextAreaElement;
    setText(value);
    queryClient.cancelQueries({ queryKey: ['translate'] });
  }, []);

  const handleDebouncedChange = useCallback((value: string) => {
    setText(value);
    queryClient.cancelQueries({ queryKey: ['translate'] });
  }, []);

  const handleSwapLanguageClick = useCallback(() => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage === 'auto' ? (data ? data.sourceLanguage : 'en') : sourceLanguage);
    if (targetTextareaRef.current) {
      setText(targetTextareaRef.current.value);
      targetTextareaRef.current.value = debouncedText; // text;
    }
  }, [sourceLanguage, targetLanguage]);

  const handleTextAreaScroll = useCallback((e: Event) => {
    const source = sourceTextareaRef.current;
    const target = targetTextareaRef.current;
    if (!source || !target) return;

    const isSourceScrolling = e.currentTarget === source;
    const scrolling = isSourceScrolling ? source : target;
    const other = isSourceScrolling ? target : source;

    const percentage = scrolling.scrollTop / (scrolling.scrollHeight - scrolling.clientHeight);
    const otherScrollTop = percentage * (other.scrollHeight - other.clientHeight);
    other.scrollTop = otherScrollTop;
  }, []);

  const { data, error } = useQuery({
    queryKey: ['translate', debouncedText, sourceLanguage, targetLanguage],
    queryFn: async ({ signal }) => {
      if (debouncedText.trim().length === 0) return;
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
    enabled: debouncedText.trim().length > 0,
    refetchOnWindowFocus: false,
    staleTime: 600000,
    gcTime: 600000,
  });

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
            <select aria-label='Source language' value={sourceLanguage} onChange={handleSourceLanguageChange}>
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
            <select aria-label='Target language' value={targetLanguage} onChange={handleTargetLanguageChange}>
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
              autofocus={true}
              value={text}
              onInput={handleTextInput}
              onScroll={handleTextAreaScroll}
            ></textarea>
            {/* <DebouncedTextarea
              ref={sourceTextareaRef}
              placeholder='Type to translate'
              autocomplete='off'
              autofocus={true}
              value={debouncedText}
              onScroll={handleTextAreaScroll}
              onDebouncedChange={handleDebouncedChange}
              delay={500}
            /> */}
          </div>
          <div class='panel'>
            <div class='panel__toolbar'>
              <span id='status'>{error instanceof Error ? error.message : error}</span>
              <button
                type='button'
                class='copy-button'
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
      {/* <button type='button' popovertarget='mypopover'>
        Toggle the popover
      </button>
      <div id='mypopover' popover>
        Popover content
      </div> */}
    </>
  );
}
