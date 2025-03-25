import { useEffect, useRef, useState } from 'react';
import { Editor, EditorProps, Monaco, OnMount } from '@monaco-editor/react';
import { extractTranslatedText, GoogleLanguage, googleLanguages, isGoogleLanguage, translate } from '@/lib/google-translate';
import { Combobox } from '@/components/combobox';
import { ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Theme, useTheme } from '@/components/theme-provider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
// import { useMobile } from '@/hooks/use-mobile';
// import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CopyButton } from './copy-button';

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
  unicodeHighlight: {
    ambiguousCharacters: false,
    invisibleCharacters: false,
    nonBasicASCII: false,
  },
  links: false,
};

// const languageOptions = Object.entries(googleLanguages).map(([value, label]) => ({ value, label }));

function getEditorTheme(theme: Theme) {
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  return theme === 'dark' ? 'vs-dark' : theme === 'system' ? (systemTheme === 'dark' ? 'vs-dark' : 'light') : 'light';
}

// TODO: Fix css
export function TranslatePanel() {
  const searchParams = new URL(location.href).searchParams;
  const sl = searchParams.get('sl');
  const tl = searchParams.get('tl');

  const { theme } = useTheme();
  const [sourceLanguage, setSourceLanguage] = useState<GoogleLanguage>(isGoogleLanguage(sl) ? sl : 'auto');
  // TODO: Fix type
  const [targetLanguage, setTargetLanguage] = useState<Exclude<GoogleLanguage, 'auto'>>(isGoogleLanguage(tl) ? (tl as Exclude<GoogleLanguage, 'auto'>) : isGoogleLanguage(navigator.language) ? (navigator.language as Exclude<GoogleLanguage, 'auto'>) : 'en');
  const [sourceText, setSourceText] = useState(searchParams.get('text') || '');
  const [targetText, setTargetText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState<Exclude<GoogleLanguage, 'auto'>>();
  const queryClient = useQueryClient();
  // const isMobile = useMobile();

  const sourceEditorRef = useRef<Parameters<OnMount>[0]>(null);
  const targetEditorRef = useRef<Parameters<OnMount>[0]>(null);
  const sourceContainerRef = useRef(null);
  const targetContainerRef = useRef(null);

  const languageOptions = Object.entries(googleLanguages).map(([value, label]) => ({ value, label: detectedLanguage && value === 'auto' ? `${googleLanguages[detectedLanguage] || detectedLanguage} - Detected` : label }));

  const {
    data: translationData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['translate', sourceText, sourceLanguage, targetLanguage],
    queryFn: async ({ signal }) => {
      if (!sourceText.trim()) return null;
      try {
        const data = await translate(sourceText, sourceLanguage, targetLanguage, signal);
        return data;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // Ignore abort errors
          return null;
        }
        throw error;
      }
    },
    enabled: Boolean(sourceText.trim()),
    staleTime: 10000,
    gcTime: 10000,
  });

  // Handle translation data
  useEffect(() => {
    if (translationData) {
      const translated = extractTranslatedText(translationData);
      setTargetText(translated);
      if (sourceLanguage === 'auto' && translationData.src) {
        setDetectedLanguage(translationData.src);
      } else {
        setDetectedLanguage(undefined);
      }
    }
  }, [translationData, sourceLanguage]);

  // Handle translation errors
  useEffect(() => {
    if (error) {
      toast.error('Translation failed', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }, [error]);

  // Handle theme changes
  useEffect(() => {
    // Force Monaco editor to update when theme changes
    const monaco = window.monaco;
    if (!monaco) return;
    monaco.editor.setTheme(getEditorTheme(theme));
  }, [theme]);

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
    if (sourceLanguage === 'auto' && !detectedLanguage) return;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage === 'auto' ? detectedLanguage! : sourceLanguage);
    setSourceText(targetText);
    setTargetText(sourceText);
  };

  const handleSourceTextChange = (value: string | undefined) => {
    setSourceText(value || '');
    if (!value) {
      setDetectedLanguage(undefined);
      setTargetText('');
    }
    // Cancel any pending queries when text changes
    queryClient.cancelQueries({ queryKey: ['translate'] });

    const url = new URL(location.href);
    url.searchParams.set('sl', sourceLanguage);
    url.searchParams.set('tl', targetLanguage);
    url.searchParams.set('text', sourceText);
    history.replaceState(null, '', url.toString());
  };

  return (
    <div className='flex h-full flex-grow flex-col gap-4'>
      <div className='flex flex-wrap gap-4'>
        <div className='flex min-w-[20rem] flex-1 items-center gap-2'>
          <div className='flex-1'>
            <Combobox options={languageOptions} value={sourceLanguage} onValueChange={setSourceLanguage as (v: string) => void} placeholder='Source language' />
          </div>
          <CopyButton value={sourceText} variant='outline' size='icon' className='shrink-0' />
        </div>

        <Button variant='outline' size='icon' onClick={handleSwapLanguages} disabled={sourceLanguage === 'auto' && (!detectedLanguage || isLoading)} className='shrink-0' aria-label='Swap languages'>
          <ArrowRightLeft className='h-5 w-5' />
        </Button>

        <div className='flex min-w-[20rem] flex-1 items-center gap-2'>
          <div className='flex-1'>
            <Combobox options={languageOptions.filter((option) => option.value !== 'auto')} value={targetLanguage} onValueChange={setTargetLanguage as (v: string) => void} placeholder='Target language' />
          </div>
          <CopyButton value={targetText} variant='outline' size='icon' className='shrink-0' />
        </div>
      </div>

      <div className='grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-2'>
        <div className='flex h-full min-h-0 flex-col'>
          <div ref={sourceContainerRef} className='min-h-0 flex-1 overflow-hidden rounded-md border'>
            <Editor
              height='100%'
              theme={getEditorTheme(theme)}
              value={sourceText}
              onChange={handleSourceTextChange}
              options={options}
              onMount={(editor) => {
                sourceEditorRef.current = editor;
              }}
              onValidate={(markers) => markers.forEach((marker) => console.log('onValidate:', marker.message))}
            />
          </div>
        </div>
        <div className='flex h-full min-h-0 flex-col'>
          <div ref={targetContainerRef} className='min-h-0 flex-1 overflow-hidden rounded-md border'>
            <Editor
              height='100%'
              theme={getEditorTheme(theme)}
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
