import { type Accessor, createEffect, createSignal, onCleanup } from 'solid-js';

export function useDebounce<T>(value: Accessor<T>, delay: number) {
  const [debouncedValue, setDebouncedValue] = createSignal<T>(value());

  createEffect(() => {
    const nextValue = value();

    const handler = setTimeout(() => {
      setDebouncedValue(() => nextValue);
    }, delay);

    onCleanup(() => {
      clearTimeout(handler);
    });
  });

  return debouncedValue;
}
