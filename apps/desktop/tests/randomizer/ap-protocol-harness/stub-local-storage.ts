/* @layer tests @kind helper */
import { vi } from 'vitest';

const stubLocalStorage = (initial: Iterable<readonly [string, string]> = []): void => {
  const store = new Map<string, string>(initial);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
  });
};

export { stubLocalStorage };
