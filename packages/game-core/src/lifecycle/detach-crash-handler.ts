/* @layer bridge-wasm @kind logic */
import { lifecycleState } from './lifecycle-state';

const detachCrashHandler = (): void => {
  if (!lifecycleState.activeCrashHandler) return;
  window.removeEventListener('error', lifecycleState.activeCrashHandler);
  lifecycleState.activeCrashHandler = null;
};

export { detachCrashHandler };
