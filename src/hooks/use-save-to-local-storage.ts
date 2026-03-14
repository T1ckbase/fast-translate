import { createEffect } from 'solid-js';

export function useSaveToLocalStorage<T extends string>(key: string, value: () => T) {
  createEffect(() => {
    try {
      localStorage.setItem(key, value());
    } catch (e) {
      console.error(`Failed to set localStorage key "${key}"`, e);
    }
  });
}
