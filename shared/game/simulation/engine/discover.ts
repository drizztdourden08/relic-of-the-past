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
import { keyAvailable } from './explorer';
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
 * A sprite is interactable when Link can stand NEXT to it — its own tiles are
 * often solid (a blocking NPC like the uncle stamps a 3×3 footprint into the
 * grid, so the spawn tile itself never floods). Any reachable tile within a
 * 2-tile ring around the spawn counts as "can talk to it".
 */
const SPRITE_TALK_RADIUS = 2;

const hasReachableNeighbor = (flood: FloodFillResult | null, tile: GridPos, radius: number = SPRITE_TALK_RADIUS): boolean => {
  if (!flood) return true;
  const grid: ReachState[][] = flood.reachable;
  for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
      if ((grid[tile.row + dr]?.[tile.col + dc] ?? 0) > 0) return true;
    }
  }
  return false;
};

/** Door records sit several tiles inside walls, away from walkable floor
 *  (internal quadrant doors run up to ~10 tiles from the nearest floor). */
const DOOR_REACH_RADIUS = 10;

/** Item ids the game grants for key drops (id-map 0x24 / 0x32). */
const SMALL_KEY_ITEM = 0x24;
const BIG_KEY_ITEM = 0x32;

/** Progress-buffer slot carrying follower_indicator (1 = Zelda tagging along). */
const FOLLOWER_SLOT = 13;

/**
 * Zelda's two scripted interactions (Sprite_76_Zelda, sprite_main.c:6251). Same
 * sanctioned-transcription class as the NPC presence conditions: the states live
 * in hardcoded C handlers that no raw read recovers. Touching her in the cell
 * starts the tagalong (which is what opens the throne-room passage); reaching
 * the Sanctuary with her runs the priest scene that completes the rescue.
 */
/**
 * Pull switches (Sprite_PullSwitch_bounce, sprite types 0x04-0x07). Pulling one
 * sets dung_flag_statechange_waterpuzzle, which the room's tag routine reads to
 * raise its trapdoors — that is what opens the Behind-Sanctuary shutter onto the
 * Sanctuary. Only meaningful in a room that still has a shutter shut.
 */
const isPullSwitch = (spriteType: number): boolean => spriteType >= 0x04 && spriteType <= 0x07;

const ZELDA_SPRITE = 0x76;
const ZELDA_STEPS = [
  { room: 0x80, step: 'zelda-follow', verb: 'Rescuing', noun: 'Zelda', following: false },
  { room: 0x12, step: 'zelda-rescue', verb: 'Bringing', noun: 'Zelda to the priest', following: true },
] as const;

/**
 * Unknown-position interactables (remote rooms) fall back to coarse
 * screen-level reachability. Overworld sprite spawns on large 2x2 areas pack
 * the second screen's coordinates past the first, so tile coords can run up
 * to ~126 on either axis — those also fall back to coarse reachability
 * instead of indexing out of the flood grid (`?? 0` would silently read them
 * as unreachable and drop them).
 */
const interactableReachable = (posKnown: boolean, flood: FloodFillResult | null, tile: GridPos): boolean =>
  !posKnown || isOutOfFloodRange(tile) || hasReachableNeighbor(flood, tile);

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

/** Room-header TAGs of the kill/clear-to-open-door family. Sequence-triggered
 *  shutters (the sanctuary's escape door) share the door kind but not the tag. */
const KILL_GATE_TAG = (t: number): boolean => t >= 0x01 && t <= 0x13;

type Interactables = NonNullable<SimObservation['interactables']>;

/** Killable enemies still alive: a carrier until its own kill target ran, a
 *  plain enemy until the room's clear trigger ran. */
const livingKillables = (state: EngineState, screenId: string, inter: Interactables): SimSprite[] =>
  inter.sprites.filter((sp) => (sp.carriesKey || sp.carriesBigKey
    ? !state.done.has(spriteKey(sp))
    : sp.kind === 'other' && !state.done.has(`clear:${screenId}`)));

const chestLabel = (chest: SimChest): string => `chest (room ${chest.roomId.toString(16)} #${chest.chestIndex})`;
const spriteLabel = (sprite: SimSprite): string => `${sprite.kind} (room ${sprite.roomId.toString(16)})`;

/** Reachable, not-yet-done interactables on the current screen as trigger targets. */
const discoverTargets = (state: EngineState, obs: SimObservation, flood: FloodFillResult | null): SimTarget[] => {
  const inter = obs.interactables;
  if (!inter) return [];
  const screenId = state.virtual.screenId;
  const targets: SimTarget[] = [];

  const killGated = (inter.tags ?? [0, 0]).some(KILL_GATE_TAG);
  const shutters = inter.doors.filter((d) => d.kind === 'shutter');
  const living = livingKillables(state, screenId, inter);
  // Open shutters with killables still alive: walking deeper into the room
  // slams the doors shut behind Link (the game's trap-door rule) — every
  // target found in this window carries the trap marker.
  const trapArm = killGated && living.length > 0 && shutters.some((d) => d.opened);

  for (const chest of inter.chests) {
    const key = chestKey(chest);
    if (chest.opened || state.done.has(key) || state.failed.has(key)) continue;
    if (!chestReachable(chest.posKnown, flood, chest.tile)) continue;
    const action = planTrigger(chest);
    if (action) {
      const tile = chest.posKnown ? chest.tile : undefined;
      targets.push({ screenId, roomId: chest.roomId, action, key, label: chestLabel(chest), noun: 'chest', verb: 'Opening', tile, trap: trapArm });
    }
  }

  const hasBombs = [...state.inventory].some((n) => n.includes('Bomb'));
  const hasSword = [...state.inventory].some((n) => n.includes('Sword'));
  const DOOR_NOUN = { 'small-key': 'key door', 'big-key': 'big key door', bombable: 'bombable wall' } as const;
  const DOOR_VERB = { 'small-key': 'Unlocking', 'big-key': 'Unlocking', bombable: 'Bombing' } as const;
  for (const door of inter.doors) {
    const kind = door.kind;
    if ((kind !== 'small-key' && kind !== 'big-key' && kind !== 'bombable') || door.opened) continue;
    const key = `door:${door.roomId}:${door.index}`;
    if (state.done.has(key) || state.failed.has(key)) continue;
    // Any held small/big key qualifies — key bookkeeping is coarse for now.
    if (kind === 'small-key' && !keyAvailable(state, '*')) continue;
    if (kind === 'big-key' && state.bigKeys.size === 0) continue;
    if (kind === 'bombable' && !hasBombs) continue;
    const tile = door.tiles[0];
    if (tile && !hasReachableNeighbor(flood, tile, DOOR_REACH_RADIUS)) continue;
    const action = { type: 'door', roomId: door.roomId, doorIndex: door.index, doorKind: kind, ...(door.cellLock ? { cellLock: true } : {}) } as const;
    const noun = door.cellLock ? 'cell lock' : DOOR_NOUN[kind];
    targets.push({ screenId, roomId: door.roomId, action, key, label: `${noun} (room ${door.roomId.toString(16)} #${door.index})`, noun, verb: DOOR_VERB[kind], tile });
  }

  for (const sprite of inter.sprites) {
    const key = spriteKey(sprite);
    if (state.done.has(key) || state.failed.has(key)) continue;
    if (!interactableReachable(sprite.posKnown, flood, sprite.tile)) continue;
    if (!spritePresent(sprite, obs.presenceState)) continue;
    const tile = sprite.posKnown ? sprite.tile : undefined;
    if (isPullSwitch(sprite.spriteType)) {
      const tagged = (inter.tags ?? [0, 0]).some((t) => t !== 0);
      if (tagged && shutters.some((d) => !d.opened)) {
        const action = { type: 'pullSwitch', roomId: sprite.roomId } as const;
        targets.push({ screenId, roomId: sprite.roomId, action, key, label: `pull switch (room ${sprite.roomId.toString(16)})`, noun: 'pull switch', verb: 'Pulling', tile });
      }
      continue;
    }
    if (sprite.spriteType === ZELDA_SPRITE) {
      const following = (obs.flags.progress[FOLLOWER_SLOT] ?? 0) === 1;
      const zstep = ZELDA_STEPS.find((z) => z.room === sprite.roomId && z.following === following);
      if (zstep) {
        const action = { type: 'progress', step: zstep.step } as const;
        targets.push({ screenId, roomId: sprite.roomId, action, key, label: zstep.noun, noun: zstep.noun, verb: zstep.verb, tile });
      }
      continue;
    }
    // A key-carrier enemy: defeating it drops its (big) key — the die-action
    // marker in the room's sprite data. Sword-gated (these are sword kills).
    if ((sprite.carriesKey || sprite.carriesBigKey) && hasSword) {
      const itemId = sprite.carriesBigKey ? BIG_KEY_ITEM : SMALL_KEY_ITEM;
      const noun = sprite.carriesBigKey ? 'big key guard' : 'key guard';
      // The LAST living killable's death satisfies the room's kill tag — its
      // kill reopens every shutter, including the ones that slammed behind Link.
      const reopens = killGated && shutters.length > 0 && living.every((l) => l === sprite);
      const action = { type: 'kill', roomId: sprite.roomId, itemId, opensShutters: reopens } as const;
      targets.push({ screenId, roomId: sprite.roomId, action, key, label: `${noun} (room ${sprite.roomId.toString(16)})`, noun, verb: 'Defeating', tile, trap: trapArm });
      continue;
    }
    const action = planTrigger(sprite);
    if (action) {
      targets.push({ screenId, roomId: sprite.roomId, action, key, label: spriteLabel(sprite), noun: sprite.kind, verb: 'Talking to', tile });
    }
  }

  // Kill-gated shutter doors: clearing the room's enemies opens them — only
  // in rooms whose header TAG is a kill/clear-to-open variant.
  if (hasSword && killGated && shutters.some((d) => !d.opened)) {
    const key = `clear:${screenId}`;
    if (!state.done.has(key) && !state.failed.has(key)) {
      const enemy = inter.sprites.find((sp) =>
        sp.kind === 'other' && !sp.carriesKey && !sp.carriesBigKey
        && interactableReachable(sp.posKnown, flood, sp.tile));
      if (enemy) {
        const action = { type: 'kill', roomId: enemy.roomId, itemId: 0xff, opensShutters: true } as const;
        targets.push({ screenId, roomId: enemy.roomId, action, key, label: `guards (room ${enemy.roomId.toString(16)})`, noun: 'guards', verb: 'Defeating', tile: enemy.tile });
      }
    }
  }

  return targets;
};

export { floodCurrent, discoverTargets, isTileReachable, hasReachableOpenTile, KILL_GATE_TAG };
