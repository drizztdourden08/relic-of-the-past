/* @layer bridge-wasm @kind logic */
import type { SimObservation, FlagSnapshot } from '@shared/game/simulation';
import { emptySnapshot, buildPresenceState, emptyPresenceState } from '@shared/game/simulation';
import { wasmReadFlagSnapshot } from '../../';
import { getCurrentInventory, pollInventoryState } from '../../tracker';
import { readMapState } from '../read-game-state';
import { IDLE_VIRTUAL } from './observe.constants';
import { virtualFrom } from './virtual-from';

const readFlags = (): FlagSnapshot => wasmReadFlagSnapshot() ?? emptySnapshot();

const observe = (): SimObservation => {
  pollInventoryState();
  const map = readMapState();
  if (!map) {
    return {
      virtual: IDLE_VIRTUAL,
      realLocation: { isIndoors: false, roomId: 0, owScreenIndex: 0 },
      inventory: new Set(),
      flags: emptySnapshot(),
      presenceState: emptyPresenceState(),
    };
  }
  const inventory = getCurrentInventory();
  const flags = readFlags();
  return {
    virtual: virtualFrom(map),
    realLocation: { isIndoors: map.isIndoors, roomId: map.roomIndex, owScreenIndex: map.overworldScreenIndex },
    inventory,
    flags,
    presenceState: buildPresenceState({
      progress: flags.progress,
      owEventInfo: flags.owEventInfo,
      roomState: flags.dungInfo,
      inventory,
    }),
  };
};

export { observe };
