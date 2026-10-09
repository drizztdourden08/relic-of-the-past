/* @layer bridge-wasm @kind logic */
import type { LifecycleState } from './lifecycle.type';

const lifecycleState: LifecycleState = {
  pendingLinkSprite: null,
  activeAutoSaveConfig: null,
  activeCrashHandler: null,
  appPauseUnsub: null,
  startGeneration: 0,
};

export { lifecycleState };
