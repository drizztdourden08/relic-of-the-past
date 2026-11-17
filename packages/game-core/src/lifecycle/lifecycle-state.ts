/* @layer bridge-wasm @kind logic */
import type { LifecycleState } from './lifecycle.type';

const lifecycleState: LifecycleState = {
  pendingLinkSprite: null,
  pendingLanguageScreens: [],
  pendingJapaneseGraphics: [],
  activeAutoSaveConfig: null,
  appPauseUnsub: null,
};

export { lifecycleState };
