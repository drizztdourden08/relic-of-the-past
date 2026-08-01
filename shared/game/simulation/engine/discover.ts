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
import type { SimObservation, SimChest, SimSprite, TriggerAction } from '../types';
import { planTrigger, npcConfigForSprite } from '../trigger/trigger-plans';
import type { PresenceGameState } from '../presence/state';
import { evaluatePresence } from '../presence/evaluate';
import { keyAvailable } from './explorer';
import { ANY_DUNGEON } from '../dungeon-key-target';
import { swordTier } from './enemy-reach-weapons';
import { evaluateRoomThreat } from './enemy-reach';
import type { RoomThreat } from './enemy-reach';
import { isPullSwitch, drainEffectForSwitchRoom, owEventSet, standingItemPresent } from './discover-switches';
import { hasReachableNeighbor, DOOR_REACH_RADIUS } from './discover-reach';
import type { Reached } from './discover-reach';
import { discoverBombableWalls } from './discover-bombs';
import type { EngineState, SimTarget } from './state';

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

/** Item ids the game grants for key drops (id-map 0x24 / 0x32). */
const SMALL_KEY_ITEM = 0x24;
const BIG_KEY_ITEM = 0x32;

/** Progress-buffer slot carrying follower_indicator (1 = the follower tagging along). */
const FOLLOWER_SLOT = 13;

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
 * Milestones reached by working a sprite rather than by opening anything, so
 * nothing in the save records them unless the run does it deliberately. Same
 * sanctioned-transcription class as FOLLOWER_STEPS above: which sprite, in which
 * room, and what it takes all live in hardcoded C handlers.
 *
 * The shelf needs the follower in tow, exactly as the mantle's own handler does
 * (`follower_indicator != 1` returns early). The sage needs nothing: his idle
 * handler routes a pendant-less player straight into the errand, which is why
 * this is separate from his boots check, which IS pendant-gated and correctly
 * out of reach this early.
 */
const EVENT_STEPS = [
  { sprite: 0xee, room: 0x51, step: 'shelf-push', verb: 'Pushing', noun: 'the throne room shelf', needsFollower: true },
  { sprite: 0x16, room: 0x105, step: 'sage-quest', verb: 'Talking to', noun: 'the first sage', needsFollower: false },
] as const;

/**
 * Unknown-position interactables (remote rooms) fall back to coarse
 * screen-level reachability. A known position is always local to the screen
 * being observed — overworld sprites are resolved to their true screen and
 * local tile before this runs (see `getOverworldSprites`) — so it is judged
 * against the flood normally.
 */
const interactableReachable = (posKnown: boolean, reached: Reached, tile: GridPos): boolean =>
  !posKnown || hasReachableNeighbor(reached, tile);

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
  const check = npcConfigForSprite(sprite.spriteType, sprite.roomId, sprite.outdoor);
  if (!check?.presence || !presenceState) return true;
  return evaluatePresence(check.presence, presenceState);
};

const chestKey = (chest: SimChest): string => `chest:${chest.roomId}:${chest.chestIndex}`;
const spriteKey = (sprite: SimSprite): string =>
  `sprite:${sprite.roomId}:${sprite.spriteType}:${sprite.tile.row}:${sprite.tile.col}`;

/** Room-header TAGs of the kill/clear-to-open-door family. Sequence-triggered
 *  shutters (the sanctuary's escape door) share the door kind but not the tag. */
const KILL_GATE_TAG = (t: number): boolean => t >= 0x01 && t <= 0x13;

/** The overworld screen the run is VIRTUALLY standing on, or null when indoors.
 *  Traversal is virtual, so the game's physical position stays wherever the save
 *  started — it cannot answer which screen an outdoor sprite has to belong to. */
const virtualOwScreen = (screenId: string): number | null => {
  const m = /^ow:(\d+)/.exec(screenId);
  return m ? Number(m[1]) : null;
};

/** No sprite gates anything here — the verdict a room with nothing to clear
 *  would trivially give, without running the combat sweep to get it. */
const EMPTY_THREAT: RoomThreat = { gating: [], clearable: true };

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

/** Reachable, not-yet-done interactables on the current screen as trigger targets. */
const discoverTargets = (state: EngineState, obs: SimObservation, reached: Reached): SimTarget[] => {
  const inter = obs.interactables;
  if (!inter) return [];
  const screenId = state.virtual.screenId;
  const owScreen = virtualOwScreen(screenId);
  const targets: SimTarget[] = [];

  const killGated = (inter.tags ?? [0, 0]).some(KILL_GATE_TAG);
  const shutters = inter.doors.filter((d) => d.kind === 'shutter');
  // The game only ever consults Sprite_CheckIfRoomIsClear in a room whose tag
  // gates on it, so the sweep only runs there — a room that isn't kill-gated
  // has no clearable/unclearable verdict to give in the first place.
  const threat = killGated && shutters.some((d) => !d.opened)
    ? evaluateRoomThreat({
        sprites: inter.sprites,
        reached,
        grids: obs.grids,
        inventory: state.inventory,
        combat: obs.combat,
        split: obs.sectionSplit,
      })
    : EMPTY_THREAT;
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
      targets.push({ screenId, roomId: chest.roomId, action, key, role: 'check', label: chestLabel(chest), noun: 'chest', verb: 'Opening', tile, trap: trapArm });
    }
  }

  // Keyed on the traversal token, not on a substring of a display name: matching
  // 'Bomb' also matches the medallion whose name starts the same way, which would
  // have handed the run bombs it never picked up.
  const hasBombs = state.reachTokens.has('bombs');
  // Bombs are permanent once obtained, so any cracked wall is openable from then on.
  if (hasBombs) targets.push(...discoverBombableWalls(state, obs, reached));
  // Keyed on the item ids the sword ladder is made of, not on a name substring:
  // the same reasoning as the bomb token below, plus 'Fighter Sword & Shield' is
  // a record of its own whose name only happens to contain the word.
  const hasSword = swordTier(state.inventory) > 0;
  const DOOR_NOUN = { 'small-key': 'key door', 'big-key': 'big key door', bombable: 'bombable wall' } as const;
  const DOOR_VERB = { 'small-key': 'Unlocking', 'big-key': 'Unlocking', bombable: 'Bombing' } as const;
  for (const door of inter.doors) {
    const kind = door.kind;
    if ((kind !== 'small-key' && kind !== 'big-key' && kind !== 'bombable') || door.opened) continue;
    const key = `door:${door.roomId}:${door.index}`;
    if (state.done.has(key) || state.failed.has(key)) continue;
    // Any held small/big key qualifies — key bookkeeping is coarse for now.
    if (kind === 'small-key' && !keyAvailable(state, ANY_DUNGEON)) continue;
    if (kind === 'big-key' && state.bigKeys.size === 0) continue;
    if (kind === 'bombable' && !hasBombs) continue;
    const tile = door.tiles[0];
    if (tile && !hasReachableNeighbor(reached, tile, DOOR_REACH_RADIUS)) continue;
    const action = { type: 'door', roomId: door.roomId, doorIndex: door.index, doorKind: kind, ...(door.cellLock ? { cellLock: true } : {}) } as const;
    const noun = door.cellLock ? 'cell lock' : DOOR_NOUN[kind];
    targets.push({ screenId, roomId: door.roomId, action, key, role: 'gate', label: `${noun} (room ${door.roomId.toString(16)} #${door.index})`, noun, verb: DOOR_VERB[kind], tile });
  }

  for (const sprite of inter.sprites) {
    const key = spriteKey(sprite);
    if (state.done.has(key) || state.failed.has(key)) continue;
    // A big overworld area's spawn table lists every screen's sprites at once,
    // already resolved to the screen each one actually sits on. One that
    // belongs to a neighbouring screen has no flood here to judge it against —
    // it becomes a target when THAT screen is observed instead.
    if (sprite.outdoor && owScreen !== null && sprite.roomId !== owScreen) continue;
    // Scripted milestones come first, and deliberately BEFORE the presence gate.
    // That gate answers "is this sprite's CHECK on offer", which for the sage is
    // his pendant-gated boots — a different reward from the same sprite. His
    // errand is available the whole time, and gating it on the boots' condition
    // hid it for the entire pre-dungeon run. Reach uses the door radius: these
    // sprites are furniture the player works from a distance, and the mantle's
    // own tile sits inside the shelf, several tiles from any standable floor.
    const estep = EVENT_STEPS.find((e) => e.sprite === sprite.spriteType && e.room === sprite.roomId);
    if (estep) {
      const inTow = (obs.flags.progress[FOLLOWER_SLOT] ?? 0) === 1;
      if ((!estep.needsFollower || inTow) && hasReachableNeighbor(reached, sprite.tile, DOOR_REACH_RADIUS)) {
        const action = { type: 'progress', step: estep.step } as const;
        const tile = sprite.posKnown ? sprite.tile : undefined;
        targets.push({ screenId, roomId: sprite.roomId, action, key, role: 'check', label: estep.noun, noun: estep.noun, verb: estep.verb, tile });
      }
      continue;
    }
    if (!interactableReachable(sprite.posKnown, reached, sprite.tile)) continue;
    if (!spritePresent(sprite, obs.presenceState)) continue;
    if (!standingItemPresent(sprite, obs.presenceState)) continue;
    const tile = sprite.posKnown ? sprite.tile : undefined;
    if (isPullSwitch(sprite.spriteType)) {
      const tagged = (inter.tags ?? [0, 0]).some((t) => t !== 0);
      const opensShutters = tagged && shutters.some((d) => !d.opened);
      const drain = drainEffectForSwitchRoom(sprite.roomId);
      // A drain switch already thrown wastes a step for no further effect —
      // offer it only while its target bit is still unset.
      const drainPending = drain !== undefined && !owEventSet(obs.presenceState, drain.screen, drain.mask);
      if (opensShutters || drainPending) {
        const action: TriggerAction = drain
          ? { type: 'pullSwitch', roomId: sprite.roomId, drain }
          : { type: 'pullSwitch', roomId: sprite.roomId };
        targets.push({ screenId, roomId: sprite.roomId, action, key, role: 'gate', label: `pull switch (room ${sprite.roomId.toString(16)})`, noun: 'pull switch', verb: 'Pulling', tile });
      }
      continue;
    }
    if (sprite.spriteType === FOLLOWER_SPRITE) {
      const following = (obs.flags.progress[FOLLOWER_SLOT] ?? 0) === 1;
      const fstep = FOLLOWER_STEPS.find((f) => f.room === sprite.roomId && f.following === following);
      if (fstep) {
        const action = { type: 'progress', step: fstep.step } as const;
        targets.push({ screenId, roomId: sprite.roomId, action, key, role: 'gate', label: fstep.noun, noun: fstep.noun, verb: fstep.verb, tile });
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
      targets.push({ screenId, roomId: sprite.roomId, action, key, role: 'check', label: `${noun} (room ${sprite.roomId.toString(16)})`, noun, verb: 'Defeating', tile, trap: trapArm });
      continue;
    }
    const action = planTrigger(sprite);
    if (action) {
      const pickup = sprite.kind === 'standing' || sprite.kind === 'overworld';
      targets.push({ screenId, roomId: sprite.roomId, action, key, role: 'check', label: spriteLabel(sprite), noun: pickup ? 'standing item' : sprite.kind, verb: pickup ? 'Picking up' : 'Talking to', tile });
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
      targets.push({ screenId, roomId: rep.sprite.roomId, action, key, role: 'gate', label: `guards (room ${rep.sprite.roomId.toString(16)})`, noun: 'guards', verb: 'Defeating', tile });
    }
  }

  return targets;
};

export { discoverTargets, isTileReachable, hasReachableOpenTile, KILL_GATE_TAG, chestKey, spriteKey };
