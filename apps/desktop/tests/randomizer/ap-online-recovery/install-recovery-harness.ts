/* @layer tests @kind helper */
import { afterEach, beforeEach, vi } from 'vitest';
import { stubLocalStorage } from '../ap-protocol-harness/stub-local-storage';

const installRecoveryHarness = (): void => {
  beforeEach(() => {
    vi.useFakeTimers();
    stubLocalStorage();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
};

export { installRecoveryHarness };
