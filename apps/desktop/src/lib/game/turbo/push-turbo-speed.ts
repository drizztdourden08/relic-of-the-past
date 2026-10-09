/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { getModule } from '../wasm-bridge';
import { turboPercentFor } from './turbo-percent-for';

const pushTurboSpeed = (settings: GameSettings): void => {
  const mod = getModule();
  if (!mod) return;
  try {
    mod.ccall('WasmSetTurboSpeed', null, ['number'], [turboPercentFor(settings)]);
  } catch {
    return;
  }
};

export { pushTurboSpeed };
