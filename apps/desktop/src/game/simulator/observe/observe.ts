/* @layer bridge-wasm @kind logic */
import type { SimObservation, FlagSnapshot } from '@rotp/navigation';
import { emptySnapshot, buildPresenceState, emptyPresenceState, IDLE_VIRTUAL, virtualFrom } from '@rotp/navigation';
import { wasmReadFlagSnapshot } from '../..';
import { getCurrentInventory, pollInventoryState } from '../../tracker';
import { readMapState } from '@rotp/game-core';

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
