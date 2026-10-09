/* @layer bridge-wasm @kind logic */
import type { MapState } from '@rotp/game-data';
import { wasmGetGameUIState } from '../bridge/ui-state';
import { parseGameUIBuffer } from '../ui-bridge-parser';

const readMapState = (): MapState | null => {
  const ui = wasmGetGameUIState();
  if (!ui) return null;
  return parseGameUIBuffer(ui.heap, ui.ptr).map;
};

export { readMapState };
