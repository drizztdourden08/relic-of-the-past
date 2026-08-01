/* @layer bridge-wasm @kind logic */
/**
 * Derives ScreenAnnotations for one screen from the SAME game reads the
 * simulator's discovery uses, so what the overlay draws is what the run acts on.
 * Nothing here re-derives game facts: doors (including cell locks), sprites with
 * their key-carrier markers, chests, room tags and detected exits all arrive from
 * the existing bridge queries.
 *
 * This file only ORCHESTRATES — per-family mapping lives in `annotate/`.
 */
import type { ScreenAnnotation, ScreenAnnotations, ScreenTag } from '@shared/game/simulation';
import type { SimLocation, SimExit } from '@shared/game/simulation';
import type { GridPos } from '@shared/game/navigation';
import type { ReachState } from '@shared/game/navigation/types';
import { roomTagName, arrivalLabel } from '@shared/game/simulation';
import { itemLabel, resolveDuplicate } from '@shared/game/logic/queries/item-duplicates';
import { getRoomChests, getRoomDoors, getRoomSprites, getOverworldSprites } from '../simulator/interactables';
import { detectScreenExits } from '../simulator/screen-exits';
import { screenNameFor } from '../simulator/screen-name';
import { wasmGetRoomTagsFor, wasmGetRoomTravelDestinationsFor } from '../';
import { isFollowerActive } from '../follower-state';
import { getCompletedChecks, getCurrentInventory } from '../tracker';
import type { CheckId, ItemId } from '@shared/game/data';
import { doorAnnotation } from './annotate/doors';
import { spriteAnnotation } from './annotate/sprites';
import { exitDoorTiles } from './annotate/exit-doors';
import { markUnreachable } from './annotate/reachability';

/** Room-header TAGs whose doors open when the room is cleared (see sim-kill-triggers). */
const KILL_GATE_TAG = (t: number): boolean => t >= 0x01 && t <= 0x13;
const hex = (n: number): string => n.toString(16);

/** Everything indoors: chests, doors, tags, sprites, exit doors. */
const annotateRoom = (roomId: number, items: ScreenAnnotation[], completed: ReadonlySet<CheckId>, inventory: ReadonlySet<ItemId>): ScreenTag[] => {
  const followerReady = isFollowerActive();

  for (const chest of getRoomChests(roomId)) {
    if (!chest.posKnown) continue;
    // Name what the chest will ACTUALLY yield: the vanilla duplicate rule swaps
    // an already-owned item for its alternate, so a lamp-owning save must not be
    // promised a Lamp here when the run would deliver 5 Rupees.
    // The item name IS the label — repeating it as detail renders "Lamp Lamp";
    // detail carries the slot, which disambiguates two same-item chests.
    const yielded = chest.itemId !== undefined ? resolveDuplicate(chest.itemId, inventory) : undefined;
    const name = yielded !== undefined ? itemLabel(yielded) : undefined;
    const swapped = chest.itemId !== undefined && yielded !== chest.itemId;
    // A big chest is its own kind: it is gated on the big key, so it must not
    // read as an ordinary available check.
    items.push({
      kind: chest.isBig ? 'big-chest' : 'chest',
      tile: chest.tile,
      label: name ?? 'chest',
      state: chest.opened ? 'done' : 'available',
      detail: swapped ? `#${chest.chestIndex} · already owned` : `#${chest.chestIndex}`,
      ...(chest.isBig ? { requires: ['bigkey:*'] } : {}),
    });
  }

  const tags = wasmGetRoomTagsFor(roomId);
  const killGated = tags.some(KILL_GATE_TAG);
  if (killGated) {
    items.push({ kind: 'kill-trigger', tile: { row: 0, col: 0 },
      label: 'clear the room to open its doors',
      detail: `tags ${tags.filter((t) => t !== 0).map((t) => `0x${hex(t)}`).join(', ')}` });
  }

  const doors = getRoomDoors(roomId);
  for (const door of doors) {
    const a = doorAnnotation(door, { followerReady, killGated });
    if (a) items.push(a);
  }

  const shutterCount = doors.filter((d) => d.kind === 'shutter').length;
  for (const sprite of getRoomSprites(roomId)) {
    const a = spriteAnnotation(sprite, { roomId, completed, shutterCount });
    if (a) items.push(a);
  }

  for (const tile of exitDoorTiles(roomId)) {
    items.push({ kind: 'exit-door', tile, label: 'exit to overworld', state: 'open' });
  }

  const dests = wasmGetRoomTravelDestinationsFor(roomId) ?? [];
  for (const warp of items.filter((a) => a.kind === 'warp-door')) {
    const to = dests[3] ?? dests[4];
    if (to) warp.detail = `→ room 0x${hex(to)}`;
  }

  return tags.filter((t) => t !== 0).map((t) => ({ value: t, name: roomTagName(t) }));
};

/**
 * How far the exit is, in words a reader can trust. `steps` is a real distance or
 * absent; the note says why it is absent rather than printing a sort score.
 */
const exitDistance = (exit: { steps?: number; stepsNote?: string }): string | undefined => {
  const where = exit.stepsNote === 'other-screen' ? ' (other screen)' : '';
  if (exit.steps !== undefined) return `${exit.steps} steps${where}`;
  if (exit.stepsNote === 'via-hop') return 'via a ledge hop';
  if (exit.stepsNote === 'other-screen') return 'other screen';
  return undefined;
};

/**
 * Distance, the WAY IN it uses, and which detection branch produced it.
 *
 * Several ways out of one screen can share a destination and still be different
 * crossings — a wall carries more than one — so a list of identical rows is
 * unreadable and, worse, unauditable: four entries reading "exit to overworld"
 * cannot be told apart or checked against the game. The simulator decides on
 * these three facts, so the widget shows all three.
 */
const exitDetail = (exit: SimExit): string | undefined => {
  const parts = [exitDistance(exit), arrivalLabel(exit), exit.origin].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : undefined;
};

/** Ways off the screen, with the walk distance the simulator ordered them by. */
const annotateExits = (screenId: string, items: ScreenAnnotation[], entryTile?: GridPos): void => {
  const detected = detectScreenExits(screenId, entryTile ? { entryTile } : {});
  for (const exit of detected?.exits ?? []) {
    if (!exit.fromTile) continue;
    // An exit has to be able to say WHERE it goes. Its destination is a traversal
    // id, not a dataset key, so the name comes from an explicit lookup that may
    // answer nothing — and the asking screen lends the palace that tells two rooms
    // sharing a number apart. `target` keeps the traversal id for the engine;
    // `label` is display only, and falls back to the id rather than to a guess.
    const label = screenNameFor(exit.to, screenId) ?? exit.to;
    items.push({ kind: 'exit', tile: exit.fromTile, label, target: exit.to,
      ...(exitDetail(exit) ? { detail: exitDetail(exit) } : {}) });
  }
};

const CHECK_KINDS: ReadonlySet<ScreenAnnotation['kind']> = new Set(['chest', 'big-chest', 'npc-check', 'standing-item']);

/**
 * Progress for the screen's checks, off each annotation's own state.
 *
 * There used to be a second test here — the completed set asked about the
 * annotation's LABEL — which could never work: a chest's label is the item it
 * yields, not a check's name. Whoever knows the check sets `state` (chests from
 * the room's open bit, NPCs and standing items from the completed set by
 * `checkId`), so the state is the whole answer.
 */
const tallyChecks = (items: readonly ScreenAnnotation[]) =>
  items.reduce(
    (acc, a) => {
      if (!CHECK_KINDS.has(a.kind)) return acc;
      if (a.state === 'done') acc.done += 1;
      else if (a.state === 'blocked') acc.blocked += 1;
      else acc.available += 1;
      return acc;
    },
    { done: 0, available: 0, blocked: 0 },
  );

/** Everything on `screenId` worth drawing, in one list. */
const annotateScreen = (
  screenId: string,
  loc: SimLocation,
  entryTile?: GridPos,
  reachable?: readonly ReachState[][],
): ScreenAnnotations => {
  const items: ScreenAnnotation[] = [];
  const completed = getCompletedChecks();

  let tags: ScreenTag[] = [];
  if (loc.isIndoors) {
    tags = annotateRoom(loc.roomId, items, completed, getCurrentInventory());
  } else {
    for (const sprite of getOverworldSprites(loc.owScreenIndex)) {
      // A big area's spawn table lists every screen's sprites, already resolved
      // to their true screen — one belonging to a neighbour is drawn when THAT
      // screen is annotated, not here.
      if (sprite.roomId !== loc.owScreenIndex) continue;
      const a = spriteAnnotation(sprite, { roomId: -1, completed, shutterCount: 0 });
      if (a) items.push(a);
    }
  }

  annotateExits(screenId, items, entryTile);
  // Last: the flood decides what is actually touchable, so it must run after
  // every family has contributed.
  markUnreachable(items, reachable);

  return {
    screenId,
    screenIndex: loc.isIndoors ? loc.roomId : loc.owScreenIndex,
    items,
    checks: tallyChecks(items),
    ...(tags.length ? { tags } : {}),
  };
};

export { annotateScreen, KILL_GATE_TAG };
