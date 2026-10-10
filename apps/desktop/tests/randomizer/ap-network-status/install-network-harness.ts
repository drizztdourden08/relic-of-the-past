/* @layer tests @kind helper */
import { afterEach, beforeEach, vi } from 'vitest';

const CLOCK_START = 1_000_000;

const installNetworkHarness = (): void => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(CLOCK_START);
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

export { installNetworkHarness };
