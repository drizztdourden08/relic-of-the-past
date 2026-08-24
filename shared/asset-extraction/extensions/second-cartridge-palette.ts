/* @layer shared-asset-extraction @kind data */
/**
 * Which palette record the extra dungeon's rooms name.
 *
 * A room header's second byte is a palette id, and the engine reads it as an index into its
 * own table of sprite/aux palette sets. The port's own id means nothing there, so the header
 * is rewritten to name an entry appended to that table for this dungeon — which is what lets
 * the engine's palette load run unmodified instead of having the index substituted underneath
 * it. The background colours themselves still come from the cartridge, one record per room.
 */

/** Entries the base game's palette-set table ships; this dungeon's is appended after them. */
const BASE_PALINFO_COUNT = 41;

const EXTRA_DUNGEON_PALINFO = BASE_PALINFO_COUNT;

export { EXTRA_DUNGEON_PALINFO };
