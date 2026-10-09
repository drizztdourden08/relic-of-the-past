/* @layer bridge-wasm @kind logic */
import { subscribeGameState } from '../wasm-bridge';
import { DEFAULT_TIMEOUT_MS } from './core-ready.constants';
import { isCoreReady } from './is-core-ready';

const whenCoreReady = (timeoutMs = DEFAULT_TIMEOUT_MS): Promise<boolean> => {
  if (isCoreReady()) return Promise.resolve(true);

  return new Promise((resolve) => {
    let settle: ((ready: boolean) => void) | null = null;

    const unsub = subscribeGameState((state) => {
      if (isCoreReady()) settle?.(true);
      else if (state.status === 'error') settle?.(false);
    });
    const timer = setTimeout(() => settle?.(false), timeoutMs);

    settle = (ready) => {
      settle = null;
      clearTimeout(timer);
      unsub();
      resolve(ready);
    };
  });
};

export { whenCoreReady };
