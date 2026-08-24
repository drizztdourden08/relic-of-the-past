/* @layer shared-asset-extraction @kind data */
/**
 * A palace index for the extra dungeon, so the engine treats it as a dungeon rather than a
 * cave.
 *
 * `cur_palace_index_x2` is what the whole dungeon identity hangs off: the map screen refuses
 * to open on 0xff, the HUD hides the map, compass and big-key slots on it, and keys are only
 * banked per dungeon for a real index. The base game ships fourteen, so this is the fifteenth.
 *
 * PLACEHOLDER CONTENT. The two map records appended here are a copy of an existing
 * single-floor dungeon's, which makes the map screen open and behave; the floor plan it draws
 * is not yet this dungeon's. Authoring the real one needs the layout/tile byte format decoded
 * (a byte per grid slot, 0xf for empty, plus one tile byte per occupied slot), which is
 * tracked separately. Everything else the index unlocks is real.
 */

/** Dungeons the base game ships; this dungeon is the next index after them. */
const BASE_PALACE_COUNT = 14;

/**
 * The engine stores this field DOUBLED — the base table holds 0, 2, ... 26 for its fourteen
 * dungeons and -1 for a cave, and every table is reached by shifting it back down. Storing the
 * plain index here would land on an existing dungeon.
 */
const EXTRA_DUNGEON_PALACE = BASE_PALACE_COUNT * 2;

/** A known-good single-floor dungeon whose map records are borrowed until ours are authored. */
const TEMPLATE_PALACE = 2;

/**
 * Append the extra dungeon's map records. Asserted on length so the appended entry lands at
 * the index the entrance record names.
 */
const appendExtraDungeonMapRecords = (layouts: Buffer[], tiles: Buffer[]): void => {
  if (layouts.length !== BASE_PALACE_COUNT || tiles.length !== BASE_PALACE_COUNT) {
    throw new Error(`Expected ${BASE_PALACE_COUNT} dungeon map records, found ${layouts.length}/${tiles.length}`);
  }
  layouts.push(Buffer.from(layouts[TEMPLATE_PALACE]));
  tiles.push(Buffer.from(tiles[TEMPLATE_PALACE]));
};

export { EXTRA_DUNGEON_PALACE, appendExtraDungeonMapRecords };
