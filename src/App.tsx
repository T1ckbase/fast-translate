// import { ThemeProvider } from '@/components/theme-provider';
// import { ModeToggle } from '@/components/mode-toggle';
// import { TranslatePanel } from '@/components/translate-panel';
// // import { Button } from '@/components/ui/button';
// import { Toaster } from '@/components/ui/sonner';
// import Github from '@/components/github-svg';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// const queryClient = new QueryClient();
import { signal } from '@preact/signals';

function App() {
  return (
    // <QueryClientProvider client={queryClient}>
    //   <ThemeProvider defaultTheme='system' storageKey='theme'>
    //     <div className='container mx-auto flex h-svh max-h-svh max-w-[90rem] flex-col overflow-hidden p-4 font-mono'>
    //       <header className='border-border mb-4 flex items-center justify-between border-b pb-4'>
    //         <h1 className='flex items-center gap-2 text-2xl font-bold'>
    //           <a href='https://t1ckbase.github.io/fast-translate'>Fast Translate</a>
    //         </h1>
    //         <div className='flex items-center space-x-4'>
    //           <a href='https://github.com/T1ckbase/fast-translate' target='_blank' rel='noopener noreferrer'>
    //             <Github className='h-5 w-5' />
    //           </a>
    //           <div className='ml-auto'>
    //             <ModeToggle />
    //           </div>
    //         </div>
    //       </header>

    //       <TranslatePanel />
    //     </div>
    //     <Toaster />
    //   </ThemeProvider>
    // </QueryClientProvider>
    <>
      <header>
        <nav>
          <h1>
            <a href='https://github.com/T1ckbase/fast-translate'>Fast Translate</a>
          </h1>
        </nav>
      </header>
      <main>
        <div class='foo'>
          <select id='source-language'>
            <option value='auto'>Detect language</option>
          </select>
          <button type='button'>Copy</button>
        </div>
      </main>
    </>
  );
}

export default App;
