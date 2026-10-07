/* @layer shared-game @kind constants */
/**
 * Who this game is to an Archipelago server.
 *
 * `AP_GAME` is the game name a slot registers under, so it has to match the world package
 * exactly. `AP_ID_BASE` is the first numeric id the world owns: locations count up from it
 * and items from `AP_ITEM_ID_OFFSET` above it (ap-ids.data.ts). `AP_WORLD_VERSION` is the
 * version of the world package that carries those tables.
 */

const AP_GAME = 'Relic of the Past';

const AP_ID_BASE = 0x52500000;

/** Items start this far above the base, so no item id can meet a location id. */
const AP_ITEM_ID_OFFSET = 0x10000;

const AP_WORLD_VERSION = '0.1.0';

export { AP_GAME, AP_ID_BASE, AP_ITEM_ID_OFFSET, AP_WORLD_VERSION };
