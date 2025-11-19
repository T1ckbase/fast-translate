import { type FC, forwardRef, useEffect, useImperativeHandle, useRef } from 'hono/jsx';
import type { JSX } from 'hono/jsx/jsx-runtime';

type Props = JSX.IntrinsicElements['textarea'] & {
  onDebouncedChange: (value: string) => void;
  delay: number;
};

export const DebouncedTextarea: FC<Props> = forwardRef<HTMLTextAreaElement, Props>(({ value, onDebouncedChange, delay = 300, ...props }, forwardedRef) => {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const timeoutRef = useRef<number>(null);

  if (forwardedRef) {
    useImperativeHandle(forwardedRef, () => internalRef.current, []);
  }

  useEffect(() => {
    if (internalRef.current && internalRef.current.value !== value) {
      internalRef.current.value = String(value ?? '');
    }
  }, [value]);

  useEffect(() => {
    const textarea = internalRef.current;
    if (!textarea) return;

    const handleInput = (e: Event) => {
      const { value: val } = e.target as HTMLTextAreaElement;

      clearTimeout(timeoutRef.current!);
      timeoutRef.current = setTimeout(() => {
        onDebouncedChange(val);
      }, delay);
    };

    textarea.addEventListener('input', handleInput);
    return () => {
      textarea.removeEventListener('input', handleInput);
      clearTimeout(timeoutRef.current!);
    };
  }, [delay, onDebouncedChange]);

  return <textarea ref={internalRef} {...props} />;
});
