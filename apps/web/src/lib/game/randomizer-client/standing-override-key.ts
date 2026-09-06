/* @layer bridge-wasm @kind logic */
/**
 * Substitution keys for standing in-world items — decides, per check record,
 * how the in-core standing table (or the plain grant seam) can identify the
 * pickup. Three certified shapes, all from the decomp audit:
 * - the standing prize sprite (the quarter-heart pickup) — keyed by overworld
 *   screen outdoors, by room (plus which horizontal half of the room, the same
 *   bit its own obtained flag uses) indoors;
 * - the dash-item dungeon key — keyed by room, in the two audited key rooms;
 * - the receive-crossing world grants (the fungus, the book, the dug-up
 *   instrument, the two tablets, the ceremonial sword) — their pickups cross
 *   the plain receive seam with a vanilla item unique across roomless givers,
 *   so they key by item alone in the npc table.
 */

import { getCheck, getItem } from '@shared/game/data';
import type { CheckId, CheckRecord } from '@shared/game/data';
import type { StandingOverrideTarget } from '../standing-overrides';

/** The standing quarter-heart prize sprite (decomp: its one touch-grant handler). */
const PRIZE_SPRITE = 0xeb;
/** The dash-item sprite (its key form bumps the key counter with no receive). */
const DASH_ITEM_SPRITE = 0x3b;

const PIECE_ITEM_ID = 'item-024';
const DUNGEON_KEY_ITEM_ID = 'item-037';

/** Rooms whose standing dungeon key is the audited dash-item grant (one per room). */
const BONK_KEY_ROOMS: ReadonlySet<number> = new Set([115, 140]);

/**
 * Which horizontal half of its room an indoor prize occupies, from the
 * detection mask (the obtained bit encodes the half: 1024 = left, 512 =
 * right). A maskless record in a shared room takes the half its roommate
 * leaves free; a maskless record alone in its room matches either half.
 */
const HALF_BY_MASK: Readonly<Record<number, number>> = { 1024: 0, 512: 1 };
const HALF_FALLBACK_BY_ROOM: Readonly<Record<number, number>> = { 283: 1 };
const HALF_ANY = 2;

const indoorHalfOf = (check: CheckRecord): number => {
  const { roomId, mask } = check.gameId;
  if (mask !== undefined && HALF_BY_MASK[mask] !== undefined) return HALF_BY_MASK[mask];
  if (roomId !== undefined && HALF_FALLBACK_BY_ROOM[roomId] !== undefined) return HALF_FALLBACK_BY_ROOM[roomId];
  return HALF_ANY;
};

const isWorldItemKind = (check: CheckRecord): boolean =>
  check.kind === 'standing' || check.kind === 'dig' || check.kind === 'bonk';

/** The in-core standing-table target for one check, or null when it has none. */
const standingOverrideKeyOf = (checkId: CheckId): StandingOverrideTarget | null => {
  const check = getCheck(checkId);
  if (!isWorldItemKind(check)) return null;
  const vanillaItem = check.vanillaItemIds[0];
  const { owScreen, roomId } = check.gameId;
  if (vanillaItem === PIECE_ITEM_ID) {
    if (owScreen !== undefined) return { area: owScreen, indoors: false, sprite: PRIZE_SPRITE, half: HALF_ANY };
    if (roomId !== undefined) return { area: roomId, indoors: true, sprite: PRIZE_SPRITE, half: indoorHalfOf(check) };
    return null;
  }
  if (vanillaItem === DUNGEON_KEY_ITEM_ID && roomId !== undefined && BONK_KEY_ROOMS.has(roomId)) {
    return { area: roomId, indoors: true, sprite: DASH_ITEM_SPRITE, half: HALF_ANY };
  }
  return null;
};

/**
 * Native receive ids of the world items whose pickup crosses the plain
 * Link_ReceiveItem seam (decomp-audited), so an item-alone npc-table entry
 * substitutes them: the fungus, the book, the dug-up instrument, the two
 * tablets (receipt method 3 — the seam still applies), the ceremonial sword.
 */
const RECEIVE_CROSSING_WORLD_IDS: ReadonlySet<number> = new Set([41, 29, 20, 15, 16, 1]);

/**
 * The item-alone grant key for a receive-crossing world item, or undefined
 * when this check's pickup does not cross the plain receive seam.
 */
const worldGrantReceiveIdOf = (check: CheckRecord): number | undefined => {
  if (!isWorldItemKind(check)) return undefined;
  const vanillaItem = check.vanillaItemIds[0];
  if (vanillaItem === undefined) return undefined;
  const receiveId = getItem(vanillaItem).gameId?.receiveItemId;
  if (receiveId === undefined || !RECEIVE_CROSSING_WORLD_IDS.has(receiveId)) return undefined;
  return receiveId;
};

export { standingOverrideKeyOf, worldGrantReceiveIdOf };
