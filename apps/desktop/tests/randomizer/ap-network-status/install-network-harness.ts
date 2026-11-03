/* @layer tests @kind helper */
import { afterEach, beforeEach, vi } from 'vitest';
import { stubLocalStorage } from '../ap-protocol-harness/stub-local-storage';

const CLOCK_START = 1_000_000;

const installNetworkHarness = (): void => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(CLOCK_START);
    stubLocalStorage();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
};

export { installNetworkHarness };
