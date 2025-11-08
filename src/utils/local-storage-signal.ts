import { effect, type Signal } from '@preact/signals-core';

export function localStorageSignal<T extends string>(targetSignal: Signal<T>, key: string): Signal<T> {
  effect(() => {
    try {
      localStorage.setItem(key, targetSignal.value);
    } catch (e) {
      console.error(`Failed to set localStorage key "${key}"`, e);
    }
  });

  return targetSignal;
}

// export function createLocalStorageSignal(key: string, initialValue: string) {
//   let storedValue: string | null = null;

//   try {
//     storedValue = localStorage.getItem(key);
//   } catch (e) {
//     console.error('Failed to access localStorage', e);
//   }

//   const initial = storedValue ?? initialValue;
//   const stateSignal = signal<string>(initial);

//   // Set up effect to persist changes
//   const dispose = effect(() => {
//     try {
//       localStorage.setItem(key, stateSignal.value);
//     } catch (e) {
//       console.error(`Failed to set localStorage key "${key}"`, e);
//     }
//   });

//   // // Sync across tabs/windows
//   // const handleStorageChange = (e: StorageEvent) => {
//   //   if (e.key === key && e.newValue !== null) {
//   //     stateSignal.value = e.newValue;
//   //   }
//   // };

//   // window.addEventListener('storage', handleStorageChange);

//   return {
//     signal: stateSignal,
//     dispose: () => {
//       dispose();
//       // window.removeEventListener('storage', handleStorageChange);
//     },
//   };
// }
