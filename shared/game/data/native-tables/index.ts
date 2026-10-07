/* @layer shared-game @kind barrel */
/**
 * The native tile tables, or empty stand-ins for them.
 *
 * The tables are transcribed from the original engine, so they live in the
 * private companion repo and are synced into `records/native-tables/`. A
 * checkout without access gets the empty values below.
 *
 * That is a real loss of function, not a cosmetic one: collision classification,
 * ledge detection, flood fill and the navigation overlay all read these, and with
 * empty tables they report nothing instead of something wrong. Every table is
 * byte-keyed, so an absent entry already means "no information about this byte".
 * The empty case is the existing miss path, taken for every byte at once.
 *
 * One glob covers the whole folder and exports are picked by name, because these
 * are twenty differently shaped tables, not one collection: sets, byte
 * maps, string lists. Their SHAPES stay in this repository
 * (`types/native-tables.ts`, `attr-group-map.ts`), because a type is erased at runtime
 * and still has to compile in a checkout with no tables to read.
 */
import type { AttrGroup } from './attr-group-map';
import type { CliffDir, DoorKind } from '../types/native-tables';
import type { TileAttrDef, TileBehavior, TileVisual } from '../types/tile-attrs-types';
import type { ConnectionTag } from '../taxonomy/connection-tags';
import type { ItemId } from '../types/ids';
import type { TraversalRequirement } from '../../navigation/nav-data.types';

const modules = import.meta.glob('../records/native-tables/*.ts', { eager: true });

// Export names are unique across the folder, so one merged namespace is enough to
// look any of them up. A missing folder merges to {} and every fallback applies.
const tables: Record<string, unknown> = Object.assign({}, ...Object.values(modules));

const pick = <T>(name: string, fallback: T): T =>
  (tables[name] === undefined ? fallback : tables[name]) as T;

const NO_BYTES = {} as const;
const NO_ATTRS: ReadonlySet<number> = new Set<number>();

const OVERWORLD_TILE_ATTRS = pick<Readonly<Record<number, TileAttrDef>>>('OVERWORLD_TILE_ATTRS', NO_BYTES);
const INTERIOR_ATTRS = pick<Readonly<Record<number, TileAttrDef>>>('INTERIOR_ATTRS', NO_BYTES);

const OVERWORLD_TILE_BEHAVIOR = pick<Readonly<Record<number, TileBehavior>>>('OVERWORLD_TILE_BEHAVIOR', NO_BYTES);
const INTERIOR_TILE_BEHAVIOR = pick<Readonly<Record<number, TileBehavior>>>('INTERIOR_TILE_BEHAVIOR', NO_BYTES);

const OVERWORLD_TILE_VISUAL = pick<Readonly<Record<number, TileVisual>>>('OVERWORLD_TILE_VISUAL', NO_BYTES);
const INTERIOR_TILE_VISUAL = pick<Readonly<Record<number, TileVisual>>>('INTERIOR_TILE_VISUAL', NO_BYTES);

const ROOM_TAG_NAMES = pick<Readonly<Record<number, string>>>('ROOM_TAG_NAMES', NO_BYTES);
const LAYER_EFFECT_NAMES = pick<readonly string[]>('LAYER_EFFECT_NAMES', []);
const COLLISION_MODE_NAMES = pick<readonly string[]>('COLLISION_MODE_NAMES', []);
const MANIPULABLE_NAMES = pick<Readonly<Record<number, string>>>('MANIPULABLE_NAMES', NO_BYTES);

const ITEM_TO_TOKEN = pick<Partial<Record<ItemId, TraversalRequirement>>>('ITEM_TO_TOKEN', {});
const IMPLIED_TOKENS = pick<Partial<Record<TraversalRequirement, readonly TraversalRequirement[]>>>('IMPLIED_TOKENS', {});
const BARRIER_TO_TOKEN = pick<Partial<Record<ConnectionTag, TraversalRequirement>>>('BARRIER_TO_TOKEN', {});

// Every door kind has to be present, so the fallback names them all instead of
// being empty: the map is total by type, and a missing key would read as a door
// kind nobody has decided about yet.
const NO_BARRIERS: Record<DoorKind, string | null> = {
  normal: null, 'small-key': null, 'big-key': null, bombable: null,
  shutter: null, switch: null, trap: null,
};
const DOOR_BARRIER = pick<Record<DoorKind, string | null>>('DOOR_BARRIER', NO_BARRIERS);

const CLIFF_TRIGGERS = pick<ReadonlySet<number>>('CLIFF_TRIGGERS', NO_ATTRS);
const CLIFF_DIRS_INDOOR = pick<Record<number, CliffDir>>('CLIFF_DIRS_INDOOR', {});
const CLIFF_DIRS_OUTDOOR = pick<Record<number, CliffDir>>('CLIFF_DIRS_OUTDOOR', {});
const CLIFF_WALL_INDOOR = pick<ReadonlySet<number>>('CLIFF_WALL_INDOOR', NO_ATTRS);
const CLIFF_WALL_OUTDOOR = pick<ReadonlySet<number>>('CLIFF_WALL_OUTDOOR', NO_ATTRS);
const DIAG_EDGE_ATTRS = pick<ReadonlySet<number>>('DIAG_EDGE_ATTRS', NO_ATTRS);
const CLIFF_BORDER_ATTRS = pick<ReadonlySet<number>>('CLIFF_BORDER_ATTRS', NO_ATTRS);
const VERTICAL_CLIFF_DIRS = pick<Record<number, -1 | 1>>('VERTICAL_CLIFF_DIRS', {});
const HORIZ_LEDGE_ATTRS = pick<ReadonlySet<number>>('HORIZ_LEDGE_ATTRS', NO_ATTRS);
const VERT_LEDGE_ATTRS = pick<ReadonlySet<number>>('VERT_LEDGE_ATTRS', NO_ATTRS);
const DRAW_DOTS_LEDGE_ATTRS = pick<ReadonlySet<number>>('DRAW_DOTS_LEDGE_ATTRS', NO_ATTRS);

/** True when the tables were synced in. Lets a caller explain an empty result. */
const hasNativeTables = (): boolean => Object.keys(OVERWORLD_TILE_ATTRS).length > 0;

export {
  OVERWORLD_TILE_ATTRS, INTERIOR_ATTRS,
  OVERWORLD_TILE_BEHAVIOR, INTERIOR_TILE_BEHAVIOR,
  OVERWORLD_TILE_VISUAL, INTERIOR_TILE_VISUAL,
  ROOM_TAG_NAMES, LAYER_EFFECT_NAMES, COLLISION_MODE_NAMES, MANIPULABLE_NAMES,
  ITEM_TO_TOKEN, IMPLIED_TOKENS, BARRIER_TO_TOKEN, DOOR_BARRIER,
  CLIFF_TRIGGERS, CLIFF_DIRS_INDOOR, CLIFF_DIRS_OUTDOOR,
  CLIFF_WALL_INDOOR, CLIFF_WALL_OUTDOOR, DIAG_EDGE_ATTRS, CLIFF_BORDER_ATTRS,
  VERTICAL_CLIFF_DIRS, HORIZ_LEDGE_ATTRS, VERT_LEDGE_ATTRS, DRAW_DOTS_LEDGE_ATTRS,
  hasNativeTables,
};
export type { AttrGroup, CliffDir, DoorKind };
