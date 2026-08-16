/* @layer bridge-wasm @kind logic */
/**
 * Derives ScreenAnnotations for one screen from the SAME game reads the
 * simulator's discovery uses, so what the overlay draws is what the run acts on.
 * Nothing here re-derives game facts: doors (including cell locks), sprites with
 * their key-carrier markers, chests and room tags all arrive from the existing
 * bridge queries. Ways on and off the screen are NOT here — those are crossings
 * (apps/web/src/lib/game/crossings/), with their own producer and renderer.
 *
 * This file only ORCHESTRATES — per-family mapping lives in `annotate/`.
 */
import type { ScreenAnnotation, ScreenAnnotations, ScreenTag } from '@shared/game/simulation';
import type { SimLocation } from '@shared/game/simulation';
import type { ReachState } from '@shared/game/navigation/types';
import { roomTagName } from '@shared/game/simulation';
import { itemLabel, resolveDuplicate } from '@shared/game/logic/queries/item-duplicates';
import { getRoomChests, getRoomDoors, getRoomSprites, getOverworldSprites } from '../simulator/interactables';
import { wasmGetRoomTagsFor } from '../';
import { isFollowerActive } from '../follower-state';
import { getCompletedChecks, getCurrentInventory } from '../tracker';
import type { CheckId, ItemId } from '@shared/game/data';
import { doorAnnotation } from './annotate/doors';
import { spriteAnnotation } from './annotate/sprites';
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

  return tags.filter((t) => t !== 0).map((t) => ({ value: t, name: roomTagName(t) }));
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
