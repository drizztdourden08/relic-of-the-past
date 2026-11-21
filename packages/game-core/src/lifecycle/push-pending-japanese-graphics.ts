/* @layer bridge-wasm @kind logic */
import { pushJapaneseGraphics } from '../bridge/wasm-call';
import type { EmscriptenModule } from '../types';
import { lifecycleState } from './lifecycle-state';

const pushPendingJapaneseGraphics = (mod: EmscriptenModule): number[] => {
  const refused = pushJapaneseGraphics(mod, lifecycleState.pendingJapaneseGraphics);
  lifecycleState.pendingJapaneseGraphics = [];
  return refused;
};

export { pushPendingJapaneseGraphics };
