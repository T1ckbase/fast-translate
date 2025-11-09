import type { JSX } from 'hono/jsx';
import { useEffect, useState } from 'preact/hooks';

type CopyButtonProps = JSX.IntrinsicElements['button'] & {
  value: string;
};

export function CopyButton({ value, ...props }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  }, [hasCopied]);

  return (
    <button
      type='button'
      class=''
      onClick={() => {
        navigator.clipboard.writeText(value);
      }}
      {...props}
    >
      <span>Copy</span>
    </button>
  );
}
