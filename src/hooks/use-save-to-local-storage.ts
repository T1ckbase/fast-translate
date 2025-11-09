import { useEffect } from 'hono/jsx';

export function useSaveToLocalStorage<T extends string>(key: string, value: T) {
  useEffect(() => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error(`Failed to set localStorage key "${key}"`, e);
    }
  }, [key, value]);
}
