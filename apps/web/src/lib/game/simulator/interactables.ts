/* @layer bridge-wasm @kind logic */
/**
 * Decodes the raw sim-queries records into the engine's SimChest / SimSprite /
 * SimDoor value types. Detection stays data-free: positions, open bits and door
 * kinds all come straight from the game.
 */
import type { SimChest, SimSprite, SimDoor } from '@shared/game/simulation';
import { wasmGetRoomChests, wasmGetRoomSpriteSpawns, wasmGetOverworldSpriteSpawns, wasmGetRoomDoorInfo, wasmGetRoomCellLocks } from '../';
import type { SimDoorDirection } from '../';
import { spriteKindFor } from './sprite-kinds';

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
    isBig: c.isBig,
    tile: { row: c.row, col: c.col },
    posKnown: c.posKnown,
    opened: c.isOpen,
    itemId: c.itemId,
  }));

/**
 * Room-addressable static sprite spawns, mapped to SimSprite. This works for
 * remote rooms the virtual player isn't in (static placement from the room's
 * sprite table). The progress-conditional NPCs the table lists (intro uncle,
 * pre-Flippers King Zora, ...) are filtered later by the engine's presence gate
 * (evaluatePresence over the NPC's declarative condition) — the sanctioned
 * single data read for the otherwise data-free detector.
 *
 * `posKnown` is always true: spawn positions come from the static room sprite
 * table and are valid remotely, and the engine floods the VIRTUAL room's grid
 * (built room-addressably) — so the flood can always judge these tiles. A
 * fail-open here would let unreachable NPCs trigger through walls/blockers.
 */
const getRoomSprites = (roomId: number): SimSprite[] =>
  wasmGetRoomSpriteSpawns(roomId).map((s) => ({
    roomId,
    spriteType: s.spriteType,
    tile: { row: s.row, col: s.col },
    posKnown: true,
    kind: spriteKindFor(s.spriteType),
    carriesKey: s.carriesKey,
    carriesBigKey: s.carriesBigKey,
  }));

const getOverworldSprites = (screenIndex: number): SimSprite[] =>
  wasmGetOverworldSpriteSpawns(screenIndex).map((s) => ({
    roomId: screenIndex,
    spriteType: s.spriteType,
    tile: { row: s.row, col: s.col },
    posKnown: true,
    kind: spriteKindFor(s.spriteType),
  }));

/**
 * A room's doors, plus its CELL LOCKS — the keyhole plates that gate a jail
 * cell (room object 0x18). They carry no door-table record at all, so they
 * arrive as big-key doors flagged `cellLock`, keyed by chest slot.
 */
const getRoomDoors = (roomId: number): SimDoor[] => [
  ...wasmGetRoomDoorInfo(roomId).map((d, index) => ({
    roomId,
    index,
    tiles: [{ row: d.row, col: d.col }],
    direction: DOOR_DIRS[d.direction],
    kind: DOOR_KINDS[d.kind] ?? 'normal',
    opened: d.isOpen,
    nativeType: d.nativeType,
    layer: d.layer,
  })),
  ...wasmGetRoomCellLocks(roomId).map((l) => ({
    roomId,
    index: l.slot,
    tiles: [{ row: l.row, col: l.col }],
    direction: 'n' as const,
    kind: 'big-key' as const,
    opened: l.opened,
    cellLock: true,
  })),
];

export { getRoomChests, getRoomSprites, getOverworldSprites, getRoomDoors };
