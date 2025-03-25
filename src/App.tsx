import { ThemeProvider } from '@/components/theme-provider';
import { ModeToggle } from '@/components/mode-toggle';
import { TranslatePanel } from '@/components/translate-panel';
// import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import Github from '@/components/github-svg';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme='system' storageKey='theme'>
        <div className='container mx-auto flex h-svh max-h-svh max-w-[90rem] flex-col p-4 font-mono'>
          <header className='border-border mb-4 flex items-center justify-between border-b pb-4'>
            <h1 className='flex items-center gap-2 text-2xl font-bold'>
              <a href='https://t1ckbase.github.io/fast-translate'>Fast Translate</a>
            </h1>
            <div className='flex items-center space-x-4'>
              <a href='https://github.com/T1ckbase/fast-translate' target='_blank' rel='noopener noreferrer'>
                <Github className='h-5 w-5' />
              </a>
              <div className='ml-auto'>
                <ModeToggle />
              </div>
            </div>
          </header>

          {/* <main className='flex flex-grow flex-col'> */}
          <TranslatePanel />
          {/* </main> */}

          {/* <Button>TEST</Button> */}
        </div>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
