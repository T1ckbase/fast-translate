import * as React from 'react';
import { CheckIcon, ClipboardIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { type VariantProps } from 'class-variance-authority';

interface CopyButtonProps extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  value: string;
  asChild?: boolean;
}

// export interface CopyButtonProps extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
// export interface CopyButtonProps extends Parameters<typeof Button> {
//   value: string;
// }

export function CopyButton({ value, ...props }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  }, [hasCopied]);

  return (
    <Button
      size='icon'
      onClick={() => {
        navigator.clipboard.writeText(value);
        setHasCopied(true);
      }}
      {...props}
    >
      <span className='sr-only'>Copy</span>
      {hasCopied ? <CheckIcon /> : <ClipboardIcon />}
    </Button>
  );
}
