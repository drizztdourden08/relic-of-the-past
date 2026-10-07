/* @layer bridge-wasm @kind logic */
/** Parses the live game UI-state buffer into the location read the runner uses. */
import type { MapState } from '@shared/game/types';
// Both straight from their own modules, not the lib/game barrel: the bridge reaches this file
// (bridge/room-doors), so a barrel import here closes a cycle back through live-settings and
// cheat-rules-memory, whose top-level subscribeGameState call then runs before wasm-bridge has
// defined it and the renderer stops on the boot splash.
import { wasmGetGameUIState } from '../bridge/ui-state';
import { parseGameUIBuffer } from '../ui-bridge-parser';

/** Current location fields (room/screen/entrance + player pixel position), or null when unavailable. */
const readMapState = (): MapState | null => {
  const ui = wasmGetGameUIState();
  if (!ui) return null;
  return parseGameUIBuffer(ui.heap, ui.ptr).map;
};

export { readMapState };
