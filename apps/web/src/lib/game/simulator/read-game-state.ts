/* @layer bridge-wasm @kind logic */
/** Parses the live game UI-state buffer into the location read the runner uses. */
import type { MapState } from '@shared/game/types';
import { wasmGetGameUIState } from '../';
import { parseGameUIBuffer } from '../ui-bridge';

/** Current location fields (room/screen/entrance + Link pixel position), or null when unavailable. */
const readMapState = (): MapState | null => {
  const ui = wasmGetGameUIState();
  if (!ui) return null;
  return parseGameUIBuffer(ui.heap, ui.ptr).map;
};

export { readMapState };
