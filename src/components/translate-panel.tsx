import { useEffect, useState } from 'react';
import { extractTranslatedText, GoogleLanguage, googleLanguages, isGoogleLanguage, translate } from '@/lib/google-translate';
import { Combobox } from '@/components/combobox';
import { ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
// import { Theme, useTheme } from '@/components/theme-provider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CopyButton } from './copy-button';

export function TranslatePanel() {
  const searchParams = new URL(location.href).searchParams;
  const sl = searchParams.get('sl');
  const tl = searchParams.get('tl');

  // const { theme } = useTheme();
  const [sourceLanguage, setSourceLanguage] = useState<GoogleLanguage>(isGoogleLanguage(sl) ? sl : 'auto');
  const [targetLanguage, setTargetLanguage] = useState<Exclude<GoogleLanguage, 'auto'>>(isGoogleLanguage(tl) ? (tl as Exclude<GoogleLanguage, 'auto'>) : isGoogleLanguage(navigator.language) ? (navigator.language as Exclude<GoogleLanguage, 'auto'>) : 'en');
  const [sourceText, setSourceText] = useState(searchParams.get('text') || '');
  const [targetText, setTargetText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState<Exclude<GoogleLanguage, 'auto'>>();
  const queryClient = useQueryClient();

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

  const handleSwapLanguages = () => {
    if (sourceLanguage === 'auto' && !detectedLanguage) return;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage === 'auto' ? detectedLanguage! : sourceLanguage);
    setSourceText(targetText);
    setTargetText(sourceText);
  };

  const handleSourceTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSourceText(value);
    if (!value) {
      setDetectedLanguage(undefined);
      setTargetText('');
    }
    // Cancel any pending queries when text changes
    queryClient.cancelQueries({ queryKey: ['translate'] });

    const url = new URL(location.href);
    url.searchParams.set('sl', sourceLanguage);
    url.searchParams.set('tl', targetLanguage);
    url.searchParams.set('text', value);
    history.replaceState(null, '', url.toString());
  };

  return (
    <div className='flex flex-1 flex-col gap-4 overflow-hidden'>
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

      <div className='grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-2'>
        <div className='flex h-full flex-col overflow-hidden'>
          <Textarea value={sourceText} onChange={handleSourceTextChange} placeholder='Enter text to translate...' className='h-full resize-none overflow-auto focus-visible:ring-0' />
        </div>
        <div className='flex h-full flex-col overflow-hidden'>
          <Textarea value={targetText} readOnly className='h-full resize-none overflow-auto focus-visible:ring-0' />
        </div>
      </div>
    </div>
  );
}
