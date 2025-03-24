import { useEffect, useRef, useState } from 'react';
import { Editor, EditorProps, Monaco, OnMount } from '@monaco-editor/react';
import { GoogleLanguage, googleLanguages } from '@/lib/google-translate';
import { Combobox } from '@/components/combobox';
import { ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from './theme-provider';
import { useMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    monaco: Monaco;
  }
}

const options: EditorProps['options'] = {
  language: 'plaintext',
  fontFamily: 'Geist Mono',
  fontSize: 16,
  minimap: { enabled: false },
  padding: { top: 8, bottom: 8 },
  renderLineHighlight: 'none',
  occurrencesHighlight: 'off',
  overviewRulerBorder: false,
  lineNumbers: 'on',
  lineNumbersMinChars: 2,
  scrollBeyondLastLine: false,
  wordWrap: 'on',
  automaticLayout: true,
  quickSuggestions: false,
};

const languageOptions = Object.entries(googleLanguages).map(([value, label]) => ({ value, label }));

export function TranslatePanel() {
  const { theme } = useTheme();
  const [sourceLanguage, setSourceLanguage] = useState<GoogleLanguage>('auto');
  const [targetLanguage, setTargetLanguage] = useState<GoogleLanguage>('zh-TW');
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const isMobile = useMobile();

  const sourceEditorRef = useRef<Parameters<OnMount>[0]>(null);
  const targetEditorRef = useRef<Parameters<OnMount>[0]>(null);
  const sourceContainerRef = useRef(null);
  const targetContainerRef = useRef(null);

  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const editorTheme = theme === 'dark' ? 'vs-dark' : theme === 'system' ? (systemTheme === 'dark' ? 'vs-dark' : 'light') : 'light';

  useEffect(() => {
    // Force Monaco editor to update when theme changes
    const monaco = window.monaco;
    if (!monaco) return;
    monaco.editor.setTheme(editorTheme);
  }, [editorTheme]);

  // Set up resize observers for editor containers
  useEffect(() => {
    if (!sourceContainerRef.current || !targetContainerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (sourceEditorRef.current) {
        sourceEditorRef.current.layout();
      }
      if (targetEditorRef.current) {
        targetEditorRef.current.layout();
      }
    });

    resizeObserver.observe(sourceContainerRef.current);
    resizeObserver.observe(targetContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleSwapLanguages = () => {
    if (sourceLanguage === 'auto') return;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceText(targetText);
    setTargetText(sourceText);
  };

  return (
    <div className='flex h-full flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <div className='min-w-80 flex-1'>
          <Combobox options={languageOptions} value={sourceLanguage} onValueChange={setSourceLanguage as (v: string) => void} placeholder='Source language' />
        </div>
        <Button variant='outline' size='icon' onClick={handleSwapLanguages} disabled={sourceLanguage === 'auto'} className='shrink-0'>
          <ArrowRightLeft className='h-5 w-5' />
        </Button>
        <div className='min-w-80 flex-1'>
          <Combobox options={languageOptions} value={targetLanguage} onValueChange={setTargetLanguage as (v: string) => void} placeholder='Target language' />
        </div>
      </div>

      <div className='grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-2'>
        <div className='flex h-full min-h-0 flex-col'>
          <div ref={sourceContainerRef} className='min-h-0 flex-1 overflow-hidden rounded-md border'>
            <Editor
              height='100%'
              theme={editorTheme}
              value={sourceText}
              onChange={(value) => setSourceText(value || '')}
              options={options}
              onMount={(editor) => {
                sourceEditorRef.current = editor;
              }}
            />
          </div>
        </div>
        <div className='flex h-full min-h-0 flex-col'>
          <div ref={targetContainerRef} className='min-h-0 flex-1 overflow-hidden rounded-md border'>
            <Editor
              height='100%'
              theme={editorTheme}
              value={targetText}
              options={{ ...options, readOnly: true }}
              onMount={(editor) => {
                targetEditorRef.current = editor;
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
