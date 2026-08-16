/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@shared/game/navigation';
import type { ReachState } from '@shared/game/navigation/types';
import { spawnLandingTile, tileInScreen } from '../flood/world-origin';

type DoorSide = 'north' | 'south' | 'east' | 'west';

interface DoorRecord {
  row: number;
  col: number;
  direction: DoorSide;
}

interface SpawnCandidate<K> {
  key: K;
  tile: GridPos;
}

interface Landing {
  tile: GridPos;
  /** Tiles toward the room's middle; negative is behind or outside the wall. */
  inward: number;
  /** Tiles along the wall, either way. */
  lateral: number;
}

/**
 * How far from a door record a walkable tile is still that door's landing.
 *
 * Matches the scan that already answers "where is this doorway" elsewhere —
 * `exitDoorAt` runs 14 deep, because notch depth and the record's own lateral
 * offset vary that much between rooms.
 */
const DOOR_REACH_RADIUS = 14;
/** How deep inside the wall a door's landing sits when the flood cannot say. */
const ASSUMED_DEPTH = 2;
const GRID = 64;

/** Toward the room's middle, away from the wall the door sits in. */
const INWARD: Record<DoorSide, GridPos> = {
  north: { row: 1, col: 0 },
  south: { row: -1, col: 0 },
  west: { row: 0, col: 1 },
  east: { row: 0, col: -1 },
};

const inGrid = (tile: GridPos): boolean =>
  tile.row >= 0 && tile.row < GRID && tile.col >= 0 && tile.col < GRID;

const clampToGrid = (tile: GridPos): GridPos => ({
  row: Math.min(GRID - 1, Math.max(0, tile.row)),
  col: Math.min(GRID - 1, Math.max(0, tile.col)),
});

const isReached = (reachable: readonly ReachState[][] | undefined, row: number, col: number): boolean =>
  (reachable?.[row]?.[col] ?? 0) > 0;

/**
 * The tile the player stands on for an entrance or fall-hole spawn record, or
 * null when the record itself lies outside the room.
 *
 * A spawn stores the sprite's TOP-LEFT, so the tile under the feet is one column
 * right and two rows down. That shift is clamped, never allowed to reject: a
 * spawn on the last rows of the grid would otherwise lose its whole crossing
 * rather than be marked.
 */
const spawnCrossingTile = (spawn: { x: number; y: number }, origin: { x: number; y: number }): GridPos | null => {
  if (!inGrid(tileInScreen(spawn.x, spawn.y, origin))) return null;
  return clampToGrid(spawnLandingTile(spawn.x, spawn.y, origin));
};

/**
 * Ranked against the best so far. A tile on the door's inward side beats one
 * beside or behind the wall however much closer that lies — otherwise a flooded
 * padding tile one step the wrong way wins over the real floor four steps in.
 * Within a side the tile nearest the door wins, then the one drifting least
 * along the wall.
 */
const isBetterLanding = (candidate: Landing, best: Landing | null): boolean => {
  if (!best) return true;
  const onSide = candidate.inward > 0;
  if (onSide !== best.inward > 0) return onSide;
  const depth = Math.abs(candidate.inward);
  const bestDepth = Math.abs(best.inward);
  if (depth !== bestDepth) return depth < bestDepth;
  return Math.abs(candidate.lateral) < Math.abs(best.lateral);
};

/**
 * The flood-reached tile that best serves as `from`'s landing, over the WHOLE
 * radius at once. Null when the flood touched nothing within reach.
 */
const measuredLanding = (
  from: GridPos,
  side: DoorSide,
  reachable: readonly ReachState[][] | undefined,
  radius = DOOR_REACH_RADIUS,
): GridPos | null => {
  const step = INWARD[side];
  let best: Landing | null = null;
  for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
      if (dr === 0 && dc === 0) continue;
      const tile = { row: from.row + dr, col: from.col + dc };
      if (!inGrid(tile) || !isReached(reachable, tile.row, tile.col)) continue;
      const candidate: Landing = {
        tile,
        inward: dr * step.row + dc * step.col,
        lateral: dr * step.col + dc * step.row,
      };
      if (isBetterLanding(candidate, best)) best = candidate;
    }
  }
  return best?.tile ?? null;
};

/** Straight inward from the record, so an unmeasurable door is never in the wall. */
const assumedLanding = (door: DoorRecord): GridPos => clampToGrid({
  row: door.row + INWARD[door.direction].row * ASSUMED_DEPTH,
  col: door.col + INWARD[door.direction].col * ASSUMED_DEPTH,
});

/** A door record's walkable tile, measured on the flood. */
const doorCrossingTile = (
  door: DoorRecord,
  reachable: readonly ReachState[][] | undefined,
  fallback?: GridPos,
): GridPos => {
  const from = { row: door.row, col: door.col };
  if (isReached(reachable, from.row, from.col)) return from;
  return measuredLanding(from, door.direction, reachable) ?? fallback ?? assumedLanding(door);
};

const squaredDistance = (a: GridPos, b: GridPos): number =>
  (a.row - b.row) ** 2 + (a.col - b.col) ** 2;

/**
 * Which door each spawn arrives through: every pair scored, then claimed
 * closest-first, so no door and no spawn is used twice and the order the spawns
 * arrive in cannot change the answer.
 */
const matchDoorsToSpawns = <K>(
  spawns: readonly SpawnCandidate<K>[],
  doors: readonly DoorRecord[],
): Map<K, DoorRecord> => {
  const pairs: { key: K; door: DoorRecord; dist: number }[] = [];
  for (const spawn of spawns) {
    for (const door of doors) {
      pairs.push({ key: spawn.key, door, dist: squaredDistance(spawn.tile, { row: door.row, col: door.col }) });
    }
  }
  pairs.sort((a, b) => a.dist - b.dist);
  const claimed = new Map<K, DoorRecord>();
  const usedDoors = new Set<DoorRecord>();
  for (const pair of pairs) {
    if (claimed.has(pair.key) || usedDoors.has(pair.door)) continue;
    claimed.set(pair.key, pair.door);
    usedDoors.add(pair.door);
  }
  return claimed;
};

export { spawnCrossingTile, doorCrossingTile, measuredLanding, matchDoorsToSpawns };
export type { DoorRecord, DoorSide };
