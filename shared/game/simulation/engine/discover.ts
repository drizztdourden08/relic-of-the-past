/* @layer shared-game @kind logic */
/**
 * Turns the in-game-discovered interactables sitting on reachable tiles into
 * triggerable targets. Reachability comes from the observation's `reached` grid
 * — the SAME flood the exit detection ran, with entrances, blockers and the
 * correct start layer. This step used to re-flood the screen itself with a
 * weaker option set (no entrances, no blockers, no startLayer), so in a
 * split-level room the flood gating every chest/door/NPC target started on the
 * wrong layer while the exit flood started on the right one. When no grid is
 * supplied the gate is skipped (every interactable counts as reachable).
 */
import type { GridPos } from '../../navigation/types';
import type { SimObservation, SimChest, SimSprite } from '../types';
import { planTrigger, npcConfigForSprite } from '../trigger/trigger-plans';
import type { PresenceGameState } from '../presence/state';
import { evaluatePresence } from '../presence/evaluate';
import { keyAvailable } from './explorer';
import { evaluateRoomThreat } from './enemy-reach';
import type { RoomThreat } from './enemy-reach';
import type { EngineState, SimTarget } from './state';

/** Tiles the detect flood reached; undefined = no grid, so gating is skipped. */
type Reached = boolean[][] | undefined;

const isTileReachable = (reached: Reached, tile: GridPos): boolean =>
  !reached || reached[tile.row]?.[tile.col] === true;

/**
 * Rows below a chest's stored tile where the player stands to open it. A chest is
 * a 2x2 (16px) solid block anchored at its top-left 8px tile, so both the stored
 * row and the row below it are the chest body. The player opens it from *directly
 * below*, facing up (the open-chest routine bails unless facing==up), feet on the
 * first walkable row under the footprint — two rows below the anchor.
 */
const CHEST_OPEN_ROW_OFFSET = 2;

/**
 * True when a chest's open-from tile is reachable. The chest spans columns
 * `col`/`col+1`; the player (16px wide) can stand below either, so a reachable tile at
 * `(row + 2, col)` OR `(row + 2, col + 1)` means the chest is openable.
 */
const hasReachableOpenTile = (reached: Reached, tile: GridPos): boolean => {
  if (!reached) return true;
  const openRow = tile.row + CHEST_OPEN_ROW_OFFSET;
  return reached[openRow]?.[tile.col] === true || reached[openRow]?.[tile.col + 1] === true;
};

const FLOOD_GRID_SIZE = 64;

/** Outside the 64x64 flood grid on either axis. */
const isOutOfFloodRange = (tile: GridPos): boolean =>
  tile.row < 0 || tile.row >= FLOOD_GRID_SIZE || tile.col < 0 || tile.col >= FLOOD_GRID_SIZE;

/**
 * A sprite is interactable when the player can stand NEXT to it — its own tiles are
 * often solid (a blocking NPC like the uncle stamps a 3×3 footprint into the
 * grid, so the spawn tile itself never floods). Any reachable tile within a
 * 2-tile ring around the spawn counts as "can talk to it".
 */
const SPRITE_TALK_RADIUS = 2;

const hasReachableNeighbor = (reached: Reached, tile: GridPos, radius: number = SPRITE_TALK_RADIUS): boolean => {
  if (!reached) return true;
  for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
      if (reached[tile.row + dr]?.[tile.col + dc] === true) return true;
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

/** Progress-buffer slot carrying follower_indicator (1 = the follower tagging along). */
const FOLLOWER_SLOT = 13;

/**
 * Pull switches (Sprite_PullSwitch_bounce, sprite types 0x04-0x07). Pulling one
 * sets dung_flag_statechange_waterpuzzle, which the room's tag routine reads to
 * raise its trapdoors — that is what opens the Behind-Sanctuary shutter onto the
 * Sanctuary. Only meaningful in a room that still has a shutter shut.
 */
const isPullSwitch = (spriteType: number): boolean => spriteType >= 0x04 && spriteType <= 0x07;

/**
 * The follower NPC's two scripted interactions (sprite type 0x76). Same
 * sanctioned-transcription class as the NPC presence conditions: the states live
 * in hardcoded C handlers that no raw read recovers. Touching her in the cell
 * starts the tagalong (which is what opens the throne-room passage); reaching
 * the Sanctuary with her runs the priest scene that completes the rescue.
 */
const FOLLOWER_SPRITE = 0x76;
const FOLLOWER_STEPS = [
  { room: 0x80, step: 'follower-join', verb: 'Rescuing', noun: 'the princess', following: false },
  { room: 0x12, step: 'follower-deliver', verb: 'Bringing', noun: 'the princess to the priest', following: true },
] as const;

/**
 * Unknown-position interactables (remote rooms) fall back to coarse
 * screen-level reachability. Overworld sprite spawns on large 2x2 areas pack
 * the second screen's coordinates past the first, so tile coords can run up
 * to ~126 on either axis — those also fall back to coarse reachability
 * instead of indexing out of the flood grid (`?? 0` would silently read them
 * as unreachable and drop them).
 */
const interactableReachable = (posKnown: boolean, reached: Reached, tile: GridPos): boolean =>
  !posKnown || isOutOfFloodRange(tile) || hasReachableNeighbor(reached, tile);

/**
 * A chest is a solid 2x2 block the player can never stand on — the game opens it only
 * from the walkable tile directly below its footprint, facing up. So a posKnown
 * chest is reachable iff that open-from tile is reachable (not any neighbor);
 * unknown-position and out-of-flood-range chests keep the coarse fallback.
 */
const chestReachable = (posKnown: boolean, reached: Reached, tile: GridPos): boolean =>
  !posKnown || isOutOfFloodRange(tile) || hasReachableOpenTile(reached, tile);

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
  const cfg = npcConfigForSprite(sprite.spriteType, sprite.roomId, sprite.outdoor);
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

/** Sprite keys the current threat sweep counts as gating the room's clear
 *  (flags4 lacks the room-clear-exempt bit — see enemy-reach.ts). */
const gatingSpriteKeys = (threat: RoomThreat): Set<string> => new Set(threat.gating.map((g) => spriteKey(g.sprite)));

/** Killable enemies still alive: a carrier until its own kill target ran, a
 *  gating sprite until the room's clear trigger ran. */
const livingKillables = (state: EngineState, screenId: string, inter: Interactables, threat: RoomThreat): SimSprite[] => {
  const gating = gatingSpriteKeys(threat);
  return inter.sprites.filter((sp) => (sp.carriesKey || sp.carriesBigKey
    ? !state.done.has(spriteKey(sp))
    : gating.has(spriteKey(sp)) && !state.done.has(`clear:${screenId}`)));
};

const chestLabel = (chest: SimChest): string => `chest (room ${chest.roomId.toString(16)} #${chest.chestIndex})`;
const spriteLabel = (sprite: SimSprite): string => `${sprite.kind} (room ${sprite.roomId.toString(16)})`;

/** Cracked-wall attrs (TileBehavior_FlaggableDoor) — solid until blasted. */
const BOMBABLE_ATTR_MIN = 0xf0;
const BOMBABLE_ATTR_MAX = 0xff;

/**
 * Cracked walls the run can blow open right now.
 *
 * The flood models one as an obstacle needing bombs, which only lets the player
 * stand ON it — the passage beyond stays shut, which is not what a bomb does. So
 * a reachable wall is offered as a TARGET instead: blast it, mark it floor, and
 * re-flood. One target per contiguous patch, since a single blast opens the lot.
 */
const discoverBombableWalls = (state: EngineState, obs: SimObservation, reached: Reached): SimTarget[] => {
  const bundle = obs.grids;
  if (!bundle) return [];
  // A split-level room keeps its floor on the LAYER grids and the dual-layer flood
  // reads those, not rawAttrGrid — so a wall scan that only looked at the raw grid
  // missed every cracked wall in such a room. Scan all of them.
  const grids = [bundle.rawAttrGrid, ...(bundle.dualLayerGrids ? [bundle.dualLayerGrids.layer0, bundle.dualLayerGrids.layer1] : [])];
  const roomId = bundle.screenIndex;
  const targets: SimTarget[] = [];
  const claimed: GridPos[] = [];
  const rows = Math.max(...grids.map((g) => g.length));
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < 64; col++) {
      if (!grids.some((g) => { const a = g[row]?.[col] ?? 0; return a >= BOMBABLE_ATTR_MIN && a <= BOMBABLE_ATTR_MAX; })) continue;
      const tile = { row, col };
      // One target per patch: a blast opens everything around it.
      if (claimed.some((p) => Math.abs(p.row - row) <= 4 && Math.abs(p.col - col) <= 4)) continue;
      if (!hasReachableNeighbor(reached, tile, DOOR_REACH_RADIUS)) continue;
      const key = `bomb:${roomId}:${row},${col}`;
      if (state.done.has(key) || state.failed.has(key)) continue;
      claimed.push(tile);
      targets.push({
        screenId: state.virtual.screenId,
        roomId,
        action: { type: 'bombWall', roomId, tile },
        key,
        label: `cracked wall (room ${roomId.toString(16)} @${col},${row})`,
        noun: 'cracked wall',
        verb: 'Bombing',
        tile,
      });
    }
  }
  return targets;
};

/** Reachable, not-yet-done interactables on the current screen as trigger targets. */
const discoverTargets = (state: EngineState, obs: SimObservation, reached: Reached): SimTarget[] => {
  const inter = obs.interactables;
  if (!inter) return [];
  const screenId = state.virtual.screenId;
  const targets: SimTarget[] = [];

  const killGated = (inter.tags ?? [0, 0]).some(KILL_GATE_TAG);
  const shutters = inter.doors.filter((d) => d.kind === 'shutter');
  const threat = evaluateRoomThreat({
    sprites: inter.sprites,
    reached,
    grids: obs.grids,
    inventory: state.inventory,
    combat: obs.combat,
  });
  const living = livingKillables(state, screenId, inter, threat);
  // Open shutters with killables still alive: walking deeper into the room
  // slams the doors shut behind the player (the game's trap-door rule) — every
  // target found in this window carries the trap marker.
  const trapArm = killGated && living.length > 0 && shutters.some((d) => d.opened);

  for (const chest of inter.chests) {
    const key = chestKey(chest);
    if (chest.opened || state.done.has(key) || state.failed.has(key)) continue;
    if (!chestReachable(chest.posKnown, reached, chest.tile)) continue;
    const action = planTrigger(chest);
    if (action) {
      const tile = chest.posKnown ? chest.tile : undefined;
      targets.push({ screenId, roomId: chest.roomId, action, key, label: chestLabel(chest), noun: 'chest', verb: 'Opening', tile, trap: trapArm });
    }
  }

  // Keyed on the traversal token, not on a substring of a display name: matching
  // 'Bomb' also matches the medallion whose name starts the same way, which would
  // have handed the run bombs it never picked up.
  const hasBombs = state.reachTokens.has('bombs');
  // Bombs are permanent once obtained, so any cracked wall is openable from then on.
  if (hasBombs) targets.push(...discoverBombableWalls(state, obs, reached));
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
    if (tile && !hasReachableNeighbor(reached, tile, DOOR_REACH_RADIUS)) continue;
    const action = { type: 'door', roomId: door.roomId, doorIndex: door.index, doorKind: kind, ...(door.cellLock ? { cellLock: true } : {}) } as const;
    const noun = door.cellLock ? 'cell lock' : DOOR_NOUN[kind];
    targets.push({ screenId, roomId: door.roomId, action, key, label: `${noun} (room ${door.roomId.toString(16)} #${door.index})`, noun, verb: DOOR_VERB[kind], tile });
  }

  for (const sprite of inter.sprites) {
    const key = spriteKey(sprite);
    if (state.done.has(key) || state.failed.has(key)) continue;
    if (!interactableReachable(sprite.posKnown, reached, sprite.tile)) continue;
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
    if (sprite.spriteType === FOLLOWER_SPRITE) {
      const following = (obs.flags.progress[FOLLOWER_SLOT] ?? 0) === 1;
      const fstep = FOLLOWER_STEPS.find((f) => f.room === sprite.roomId && f.following === following);
      if (fstep) {
        const action = { type: 'progress', step: fstep.step } as const;
        targets.push({ screenId, roomId: sprite.roomId, action, key, label: fstep.noun, noun: fstep.noun, verb: fstep.verb, tile });
      }
      continue;
    }
    // A key-carrier enemy: defeating it drops its (big) key — the die-action
    // marker in the room's sprite data. Sword-gated (these are sword kills).
    if ((sprite.carriesKey || sprite.carriesBigKey) && hasSword) {
      const itemId = sprite.carriesBigKey ? BIG_KEY_ITEM : SMALL_KEY_ITEM;
      const noun = sprite.carriesBigKey ? 'big key guard' : 'key guard';
      // The LAST living killable's death satisfies the room's kill tag — its
      // kill reopens every shutter, including the ones that slammed behind the player.
      const reopens = killGated && shutters.length > 0 && living.every((l) => l === sprite);
      const action = { type: 'kill', roomId: sprite.roomId, itemId, opensShutters: reopens } as const;
      targets.push({ screenId, roomId: sprite.roomId, action, key, label: `${noun} (room ${sprite.roomId.toString(16)})`, noun, verb: 'Defeating', tile, trap: trapArm });
      continue;
    }
    const action = planTrigger(sprite);
    if (action) {
      const pickup = sprite.kind === 'standing' || sprite.kind === 'overworld';
      targets.push({ screenId, roomId: sprite.roomId, action, key, label: spriteLabel(sprite), noun: pickup ? 'standing item' : sprite.kind, verb: pickup ? 'Picking up' : 'Talking to', tile });
    }
  }

  // Kill-gated shutter doors: clearing the room's enemies opens them — only
  // in rooms whose header TAG is a kill/clear-to-open variant, and only once
  // EVERY gating sprite is confirmed killable (RoomThreat.clearable), not just
  // the first one found.
  if (killGated && shutters.some((d) => !d.opened) && threat.clearable && threat.gating.length > 0) {
    const key = `clear:${screenId}`;
    if (!state.done.has(key) && !state.failed.has(key)) {
      // Key-carriers get their own dedicated drop target above; pick a
      // non-carrier gating sprite to anchor this one where possible.
      const rep = threat.gating.find((g) => !g.sprite.carriesKey && !g.sprite.carriesBigKey) ?? threat.gating[0];
      const tile = rep.from ?? rep.sprite.tile;
      const action = { type: 'kill', roomId: rep.sprite.roomId, itemId: 0xff, opensShutters: true } as const;
      targets.push({ screenId, roomId: rep.sprite.roomId, action, key, label: `guards (room ${rep.sprite.roomId.toString(16)})`, noun: 'guards', verb: 'Defeating', tile });
    }
  }

  return targets;
};

export { discoverTargets, isTileReachable, hasReachableOpenTile, KILL_GATE_TAG };
