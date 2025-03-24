import { ThemeProvider } from '@/components/theme-provider';
import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { ModeToggle } from '@/components/mode-toggle';
import { Combobox } from '@/components/combobox';
import { TranslatePanel } from '@/components/translate-panel';
import { Button } from '@/components/ui/button';

function App() {
  return (
    <ThemeProvider defaultTheme='system' storageKey='theme'>
      <div className='container mx-auto flex min-h-svh max-w-7xl flex-col p-4 font-mono'>
        <header className='border-border mb-4 flex items-center justify-between border-b pb-4'>
          <h1 className='text-2xl font-bold'>Fast Translate</h1>
          <div className='flex items-center space-x-4'>
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
    </ThemeProvider>
  );
}

export default App;
