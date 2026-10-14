/* @layer bridge-wasm @kind logic */
import type { LifecycleState } from './lifecycle.type';

const lifecycleState: LifecycleState = {
  pendingLinkSprite: null,
  activeAutoSaveConfig: null,
  appPauseUnsub: null,
};

export { lifecycleState };
