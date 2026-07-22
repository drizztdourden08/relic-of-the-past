/* @layer shared-game @kind logic */
/**
 * Flood-fills the current screen (reusing the existing BFS) and turns the
 * in-game-discovered interactables sitting on reachable tiles into triggerable
 * targets. When no grids are supplied the tile-reachability gate is skipped
 * (every discovered interactable is considered reachable).
 */
import type { FloodFillResult, GridPos, ReachState } from '../../navigation/types';
import type { TileReq } from '../../navigation/tile-attrs';
import { floodFillScreen } from '../../navigation';
import type { SimObservation, SimChest, SimSprite } from '../types';
import { planTrigger, npcConfigForSprite } from '../trigger/trigger-plans';
import type { PresenceGameState } from '../presence/state';
import { evaluatePresence } from '../presence/evaluate';
import type { EngineState, SimTarget } from './state';

const TILE_REQ_TOKENS: readonly string[] = ['lift.1', 'lift.2', 'lift.3', 'hammer', 'boots', 'flippers', 'hookshot'];

const toTileReqSet = (tokens: Set<string>): Set<TileReq> => {
  const set = new Set<TileReq>();
  for (const t of tokens) if (TILE_REQ_TOKENS.includes(t)) set.add(t as TileReq);
  return set;
};

/** Run the shared BFS for the current screen, or null when no grids are present. */
const floodCurrent = (state: EngineState, obs: SimObservation): FloodFillResult | null => {
  const grids = obs.grids;
  if (!grids) return null;
  return floodFillScreen(grids.rawAttrGrid, grids.screenIndex, {
    tileContext: grids.tileContext,
    inventory: toTileReqSet(state.reachTokens),
    startPos: state.virtual.tile,
    dualLayerGrids: grids.dualLayerGrids,
    staircaseType: grids.staircaseType,
  });
};

const isTileReachable = (flood: FloodFillResult | null, tile: GridPos): boolean => {
  if (!flood) return true;
  const grid: ReachState[][] = flood.reachable;
  return (grid[tile.row]?.[tile.col] ?? 0) > 0;
};

/**
 * Rows below a chest's stored tile where Link stands to open it. A chest is a
 * 2x2 (16px) solid block anchored at its top-left 8px tile, so both the stored
 * row and the row below it are the chest body. Link opens it from *directly
 * below*, facing up (`Link_PerformOpenChest` bails unless facing==up), his feet
 * on the first walkable row under the footprint — two rows below the anchor.
 */
const CHEST_OPEN_ROW_OFFSET = 2;

/**
 * True when a chest's open-from tile is reachable. The chest spans columns
 * `col`/`col+1`; Link (16px wide) can stand below either, so a reachable tile at
 * `(row + 2, col)` OR `(row + 2, col + 1)` means the chest is openable.
 */
const hasReachableOpenTile = (flood: FloodFillResult | null, tile: GridPos): boolean => {
  if (!flood) return true;
  const grid: ReachState[][] = flood.reachable;
  const openRow = tile.row + CHEST_OPEN_ROW_OFFSET;
  return (grid[openRow]?.[tile.col] ?? 0) > 0 || (grid[openRow]?.[tile.col + 1] ?? 0) > 0;
};

const FLOOD_GRID_SIZE = 64;

/** Outside the 64x64 flood grid on either axis. */
const isOutOfFloodRange = (tile: GridPos): boolean =>
  tile.row < 0 || tile.row >= FLOOD_GRID_SIZE || tile.col < 0 || tile.col >= FLOOD_GRID_SIZE;

/**
 * Unknown-position interactables (remote rooms) fall back to coarse
 * screen-level reachability. Overworld sprite spawns on large 2x2 areas pack
 * the second screen's coordinates past the first, so tile coords can run up
 * to ~126 on either axis — those also fall back to coarse reachability
 * instead of indexing out of the flood grid (`?? 0` would silently read them
 * as unreachable and drop them).
 */
const interactableReachable = (posKnown: boolean, flood: FloodFillResult | null, tile: GridPos): boolean =>
  !posKnown || isOutOfFloodRange(tile) || isTileReachable(flood, tile);

/**
 * A chest is a solid 2x2 block Link can never stand on — the game opens it only
 * from the walkable tile directly below its footprint, facing up. So a posKnown
 * chest is reachable iff that open-from tile is reachable (not any neighbor);
 * unknown-position and out-of-flood-range chests keep the coarse fallback.
 */
const chestReachable = (posKnown: boolean, flood: FloodFillResult | null, tile: GridPos): boolean =>
  !posKnown || isOutOfFloodRange(tile) || hasReachableOpenTile(flood, tile);

/**
 * Whether a discovered sprite is actually spawned at the current progress. A
 * sprite is only a triggerable target when it maps to a check-giving NPC (has a
 * CHECK_NPC_FLAGS config) AND that NPC's declarative presence condition holds.
 * Reading that condition is the sim's SANCTIONED single exception to the
 * otherwise data-free detector (see presence-condition.ts): the game gates NPC
 * spawns inside hardcoded C prep functions that no raw read can recover, so the
 * conditions are transcribed as data and evaluated here. Non-check sprites
 * (no config) fail open — planTrigger returns null for them anyway. When no
 * presenceState was observed, gating also fails open (all present).
 */
const spritePresent = (sprite: SimSprite, presenceState: PresenceGameState | undefined): boolean => {
  const cfg = npcConfigForSprite(sprite.spriteType, sprite.roomId);
  if (!cfg?.presence || !presenceState) return true;
  return evaluatePresence(cfg.presence, presenceState);
};

const chestKey = (chest: SimChest): string => `chest:${chest.roomId}:${chest.chestIndex}`;
const spriteKey = (sprite: SimSprite): string =>
  `sprite:${sprite.roomId}:${sprite.spriteType}:${sprite.tile.row}:${sprite.tile.col}`;

const chestLabel = (chest: SimChest): string => `chest (room ${chest.roomId.toString(16)} #${chest.chestIndex})`;
const spriteLabel = (sprite: SimSprite): string => `${sprite.kind} (room ${sprite.roomId.toString(16)})`;

/** Reachable, not-yet-done interactables on the current screen as trigger targets. */
const discoverTargets = (state: EngineState, obs: SimObservation, flood: FloodFillResult | null): SimTarget[] => {
  const inter = obs.interactables;
  if (!inter) return [];
  const screenId = state.virtual.screenId;
  const targets: SimTarget[] = [];

  for (const chest of inter.chests) {
    const key = chestKey(chest);
    if (chest.opened || state.done.has(key) || state.failed.has(key)) continue;
    if (!chestReachable(chest.posKnown, flood, chest.tile)) continue;
    const action = planTrigger(chest);
    if (action) targets.push({ screenId, roomId: chest.roomId, action, key, label: chestLabel(chest) });
  }

  for (const sprite of inter.sprites) {
    const key = spriteKey(sprite);
    if (state.done.has(key) || state.failed.has(key)) continue;
    if (!interactableReachable(sprite.posKnown, flood, sprite.tile)) continue;
    if (!spritePresent(sprite, obs.presenceState)) continue;
    const action = planTrigger(sprite);
    if (action) targets.push({ screenId, roomId: sprite.roomId, action, key, label: spriteLabel(sprite) });
  }

  return targets;
};

export { floodCurrent, discoverTargets, isTileReachable, hasReachableOpenTile };
