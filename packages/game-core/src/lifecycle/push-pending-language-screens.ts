/* @layer bridge-wasm @kind logic */
import { pushLanguageScreens } from '../bridge/wasm-call';
import type { EmscriptenModule } from '../types';
import { lifecycleState } from './lifecycle-state';

const pushPendingLanguageScreens = (mod: EmscriptenModule): number[] => {
  const refused = pushLanguageScreens(mod, lifecycleState.pendingLanguageScreens);
  lifecycleState.pendingLanguageScreens = [];
  return refused;
};

export { pushPendingLanguageScreens };
