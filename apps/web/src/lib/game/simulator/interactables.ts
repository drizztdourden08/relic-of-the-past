/* @layer bridge-wasm @kind logic */
/**
 * Decodes the raw sim-queries records into the engine's SimChest / SimSprite /
 * SimDoor value types. Detection stays data-free: positions, open bits and door
 * kinds all come straight from the game.
 */
import type { SimChest, SimSprite, SimDoor } from '@shared/game/simulation';
import { wasmGetRoomChests, wasmGetRoomSpriteSpawns, wasmGetOverworldSpriteSpawns, wasmGetRoomDoorInfo } from '../';
import type { SimDoorDirection } from '../';
import { spriteKindFor } from './sprite-kinds';
import { readMapState } from './read-game-state';

const DOOR_DIRS: Record<SimDoorDirection, SimDoor['direction']> = {
  north: 'n',
  south: 's',
  west: 'w',
  east: 'e',
};

// Matches SimDoorKind() in core/game-hooks/sim_queries.c.
const DOOR_KINDS: SimDoor['kind'][] = ['normal', 'small-key', 'big-key', 'bombable', 'shutter', 'switch', 'trap'];

const getRoomChests = (roomId: number): SimChest[] =>
  wasmGetRoomChests(roomId).map((c) => ({
    roomId,
    chestIndex: c.chestIndex,
    tile: { row: c.row, col: c.col },
    posKnown: c.posKnown,
    opened: c.isOpen,
    itemId: c.itemId,
  }));

/**
 * Room-addressable static sprite spawns, mapped to SimSprite. This works for
 * remote rooms the virtual Link isn't in (static placement from the room's
 * sprite table). The progress-conditional NPCs the table lists (intro uncle,
 * pre-Flippers King Zora, ...) are filtered later by the engine's presence gate
 * (evaluatePresence over the NPC's declarative condition) — the sanctioned
 * single data read for the otherwise data-free detector.
 *
 * The flood-fill grid the engine reachability-checks against is only ever
 * built for the room the game is *currently loaded into* — a query for any
 * other room has no valid grid to test tiles against. So `posKnown` mirrors
 * current-vs-remote the same way the C chest query already does: `true` for
 * the loaded room (the flood can judge it), `false` for a remote room (fall
 * back to the engine's coarse screen-level reachability instead of wrongly
 * failing the loaded room's flood check against a different room's tiles).
 */
const getRoomSprites = (roomId: number): SimSprite[] => {
  const map = readMapState();
  const isLoadedRoom = map?.isIndoors === true && map.roomIndex === roomId;
  return wasmGetRoomSpriteSpawns(roomId).map((s) => ({
    roomId,
    spriteType: s.spriteType,
    tile: { row: s.row, col: s.col },
    posKnown: isLoadedRoom,
    kind: spriteKindFor(s.spriteType),
  }));
};

const getOverworldSprites = (screenIndex: number): SimSprite[] =>
  wasmGetOverworldSpriteSpawns(screenIndex).map((s) => ({
    roomId: screenIndex,
    spriteType: s.spriteType,
    tile: { row: s.row, col: s.col },
    posKnown: true,
    kind: spriteKindFor(s.spriteType),
  }));

const getRoomDoors = (roomId: number): SimDoor[] =>
  wasmGetRoomDoorInfo(roomId).map((d) => ({
    roomId,
    tiles: [{ row: d.row, col: d.col }],
    direction: DOOR_DIRS[d.direction],
    kind: DOOR_KINDS[d.kind] ?? 'normal',
    opened: d.isOpen,
  }));

export { getRoomChests, getRoomSprites, getOverworldSprites, getRoomDoors };
