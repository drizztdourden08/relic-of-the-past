/* @layer tests @kind helper */
import { afterEach, beforeEach, vi } from 'vitest';

const installRecoveryHarness = (): void => {
  beforeEach(() => {
    vi.useFakeTimers();
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => { store.set(key, value); },
      removeItem: (key: string) => { store.delete(key); },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
};

export { installRecoveryHarness };
