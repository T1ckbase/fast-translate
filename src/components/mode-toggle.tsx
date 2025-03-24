import { Moon, Sun, Monitor } from 'lucide-react';

// import { Button } from '@/components/ui/button';
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Theme, useTheme } from '@/components/theme-provider';

// export function ModeToggle() {
//   const { setTheme } = useTheme();

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant='outline' size='icon'>
//           <Sun className='h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90' />
//           <Moon className='absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0' />
//           <span className='sr-only'>Toggle theme</span>
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align='end'>
//         <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
//         <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
//         <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Tabs defaultValue={theme} onValueChange={(newTheme) => setTheme(newTheme as Theme)}>
      <TabsList>
        <TabsTrigger value='ligth'>
          <Sun className='rotate-0 transition-all dark:-rotate-90' />
        </TabsTrigger>
        <TabsTrigger value='dark'>
          <Moon className='rotate-15 transition-all dark:rotate-0' />
        </TabsTrigger>
        <TabsTrigger value='system'>
          <Monitor />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
