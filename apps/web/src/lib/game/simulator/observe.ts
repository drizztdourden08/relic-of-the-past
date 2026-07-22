/* @layer bridge-wasm @kind logic */
/**
 * Builds a SimObservation from live game state. The real location comes from the
 * game UI-state buffer; the virtual location is that same spot expressed as a
 * known screen id (via screen detection) plus Link's pixel→tile conversion.
 * Inventory is the tracker's Set; flags are independent SRAM copies for diffing.
 */
import type { SimObservation, VirtualLink, FlagSnapshot } from '@shared/game/simulation';
import { emptySnapshot, buildPresenceState, emptyPresenceState } from '@shared/game/simulation';
import type { MapState } from '@shared/game/types';
import type { VariantGameState } from '@shared/game/data/screens';
import { resolveCurrentScreen } from '@shared/game/data/screens';
import { linkStartTile } from '@shared/game/navigation/link-start-tile';
import { wasmGetProgressIndicator, wasmReadFlagSnapshot } from '../';
import { getCompletedChecks, getCurrentInventory, pollInventoryState } from '../tracker';
import { readMapState } from './read-game-state';

const IDLE_VIRTUAL: VirtualLink = { screenId: 'unknown', tile: { row: 0, col: 0 } };

const virtualFrom = (map: MapState): VirtualLink => {
  // Feed the SAME disambiguation context the navigation widget's useScreenDetection
  // uses (entranceId/whichEntrance + palaceIndex + progressTier + completedChecks).
  // An indoor roomIndex is not unique on its own — an interior can share a room
  // value with a dungeon room (e.g. the seed run started in Hyrule Castle "Water
  // Room" 0x11 during the rain intro, whose room value collided with a Kakariko
  // interior, mis-seeding virtual Link there until the first hop). palaceIndex
  // steers the resolver to the dungeon match and whichEntrance disambiguates
  // shared-room interiors, so the first observe resolves correctly.
  const variantState: VariantGameState = {
    completedChecks: getCompletedChecks(),
    entranceId: map.whichEntrance ?? undefined,
    progressTier: wasmGetProgressIndicator()?.tier,
  };
  const screen = resolveCurrentScreen(
    map.isIndoors, map.palaceIndex, map.roomIndex, map.overworldScreenIndex, map.whichEntrance, variantState,
  );
  const screenId = screen?.id ?? (map.isIndoors ? `room:${map.roomIndex}` : `ow:${map.overworldScreenIndex}`);

  const screenWorldX = map.isIndoors ? Math.floor(map.linkX / 512) * 512 : (map.overworldScreenIndex & 7) * 512;
  const screenWorldY = map.isIndoors ? Math.floor(map.linkY / 512) * 512 : ((map.overworldScreenIndex >> 3) & 7) * 512;
  const tile = linkStartTile({ linkX: map.linkX, linkY: map.linkY, screenWorldX, screenWorldY });

  return { screenId, tile };
};

const readFlags = (): FlagSnapshot => wasmReadFlagSnapshot() ?? emptySnapshot();

const observe = (): SimObservation => {
  // Refresh the tracker's inventory/completed-check sets from WRAM so the
  // observation reflects the latest state (notably right after a delivered item).
  // Non-forced: it re-reads every call but only logs/notifies on an actual change.
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
  const inventory = new Set(getCurrentInventory());
  const flags = readFlags();
  return {
    virtual: virtualFrom(map),
    realLocation: { isIndoors: map.isIndoors, roomId: map.roomIndex, owScreenIndex: map.overworldScreenIndex },
    inventory,
    flags,
    // NPC-presence snapshot: progress bytes + follower live in the 16-byte
    // progress buffer, the SRAM copies come from the same flag snapshot.
    presenceState: buildPresenceState({
      progress: flags.progress,
      owEventInfo: flags.owEventInfo,
      roomState: flags.dungInfo,
      inventory,
    }),
  };
};

export { observe };
