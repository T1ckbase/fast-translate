import { effect, type Signal, signal } from '@preact/signals-core';

export function debounceSignal<T>(targetSignal: Signal<T>, timeoutMs = 0): Signal<T> {
  const debouncedSignal = signal<T>(targetSignal.value);

  effect(() => {
    const value = targetSignal.value;
    const timeout = setTimeout(() => {
      debouncedSignal.value = value;
    }, timeoutMs);

    // Clean up the previous timeout when the effect runs again or is destroyed
    return () => {
      clearTimeout(timeout);
    };
  });

  return debouncedSignal;
}
