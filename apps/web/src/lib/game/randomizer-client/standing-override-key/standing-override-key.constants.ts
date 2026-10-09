/* @layer bridge-wasm @kind constants */
const PRIZE_SPRITE = 0xeb;
const DASH_ITEM_SPRITE = 0x3b;

const HEART_PIECE_ITEM_ID = 'item-024';
const DUNGEON_KEY_ITEM_ID = 'item-037';

const BONK_KEY_ROOMS: ReadonlySet<number> = new Set([115, 140]);

const HALF_BY_MASK: Readonly<Record<number, number>> = { 1024: 0, 512: 1 };
const HALF_FALLBACK_BY_ROOM: Readonly<Record<number, number>> = { 283: 1 };
const HALF_ANY = 2;

const RECEIVE_CROSSING_WORLD_IDS: ReadonlySet<number> = new Set([41, 29, 20, 15, 16, 1]);

export {
  BONK_KEY_ROOMS, DASH_ITEM_SPRITE, DUNGEON_KEY_ITEM_ID, HALF_ANY, HALF_BY_MASK, HALF_FALLBACK_BY_ROOM,
  HEART_PIECE_ITEM_ID, PRIZE_SPRITE, RECEIVE_CROSSING_WORLD_IDS,
};
