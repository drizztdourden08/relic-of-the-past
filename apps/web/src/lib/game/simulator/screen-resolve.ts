/* @layer bridge-wasm @kind logic */
// Numeric screen/room indices -> dataset screen ids, progress-aware. Room indices collide across
// the dataset (room 0x55 is BOTH 'dam' and a castle's secret passage), so interior resolution
// prefers candidates sharing the SOURCE screen's world, then its location.
import type { GridPos } from '@shared/game/navigation';
import type { VariantGameState } from '@shared/game/logic/queries/detection';
import type { ScreenRecord } from '@shared/game/data';
import type { SimArea } from '@shared/game/simulation';
import { locationForScreen } from './screen-location';
import { computeBigScreenGroup } from '@domains/widgets/navigation/widget-helpers';
import { wasmGetEntranceSpawns, wasmGetProgressIndicator } from '../';
import { getCompletedChecks } from '../tracker';

const variantState = (): VariantGameState => ({
  completedChecks: getCompletedChecks(),
  progressTier: wasmGetProgressIndicator()?.tier,
});

/**
 * Overworld screen index -> traversal key. That key is the GAME's number, never a dataset id:
 * identity drives `visited`, the frontier and the graph, and a dataset-keyed identity let a
 * wrong or missing `roomIndex` merge two places or drop a room. Names are for logs only.
 */
const owScreenId = (idx: number): string => `ow:${idx}`;

/** Progress-matching variant first, then the non-variant base, then anything. */
const pickVariant = (list: ScreenRecord[]): ScreenRecord => {
  const tier = wasmGetProgressIndicator()?.tier ?? 0;
  const cond = (s: ScreenRecord) => s.variant?.condition;
  const match = list.find((s) => {
    const c = cond(s);
    return c?.type === 'progress' && (c.max == null || tier <= c.max) && (c.min == null || tier >= c.min);
  });
  return match ?? list.find((s) => !s.variant) ?? list[0];
};

/**
 * Interior room index -> traversal key. Same rule as `owScreenId`: the game's number is the
 * identity. `src` stays in the signature (callers pass it) but no longer influences identity.
 */
/**
 * Which half of the room a landing tile sits in. One room SLOT can hold two separate interiors
 * side by side (room 0x122: entrance 101 lands at col 15, entrance 102 at col 47, in different
 * worlds). A node keyed on the room alone joined the two worlds through a hut; quantising the
 * landing tile keeps them apart.
 */
const REGION_SHIFT = 5;

const regionQualifier = (tile?: GridPos): string =>
  tile ? `@${tile.row >> REGION_SHIFT},${tile.col >> REGION_SHIFT}` : '';

/**
 * Rooms the game leaves by RESTORING the overworld state it cached on the way in
 * (`LoadOverworldFromDungeon`, core/zelda3/src/overworld.c:1791):
 *
 *   if (room != 0x104 && room < 0x180 && room >= 0x100) LoadCachedEntranceProperties();
 *
 * Several overworld doors share one such interior (lw-11 and lw-35 both use entrance 101),
 * so the node has to carry the door it came in by.
 */
const usesCachedEntrance = (roomId: number): boolean =>
  roomId >= 0x100 && roomId < 0x180 && roomId !== 0x104;

/** The `^from` suffix of a node key, naming the cached entrance it was reached by, or ''. */
const cachedEntranceOf = (screenId: string): string => {
  const at = screenId.indexOf('^');
  return at === -1 ? '' : screenId.slice(at);
};

const interiorScreenId = (destRoom: number, landing?: GridPos, cameFrom?: string): string => {
  const base = `room:${destRoom}${regionQualifier(landing)}`;
  if (!usesCachedEntrance(destRoom) || !cameFrom) return base;
  // Already qualified (a hop deeper into the same cave), so keep the original door.
  return cameFrom.startsWith('^') ? `${base}${cameFrom}` : `${base}^${cameFrom}`;
};

/** In-room landing tile for an entrance (its spawn point, always walkable). */
const spawnTile = (entranceId: number, destRoom: number): GridPos | undefined => {
  const spawn = wasmGetEntranceSpawns()?.[entranceId];
  if (!spawn) return undefined;
  const row = Math.floor((spawn.y - Math.floor(destRoom / 16) * 512) / 8);
  const col = Math.floor((spawn.x - (destRoom % 16) * 512) / 8);
  return row >= 0 && row < 64 && col >= 0 && col < 64 ? { row, col } : undefined;
};

/** Big multi-sub-screen area membership (castle-style groups); undefined = 1×1. */
const screenAreaInfo = (screenId: string): SimArea | undefined => {
  const loc = locationForScreen(screenId);
  if (!loc || loc.isIndoors) return undefined;
  const group = computeBigScreenGroup(loc.owScreenIndex);
  if (group.length <= 1) return undefined;
  const head = Math.min(...group);
  return { key: `area-${head}`, label: `area 0x${head.toString(16)}`, size: group.length };
};

export { owScreenId, interiorScreenId, regionQualifier, usesCachedEntrance, cachedEntranceOf, spawnTile, screenAreaInfo };
