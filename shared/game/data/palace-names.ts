/* @layer shared-game-data @kind data */
/**
 * The game's own label for each palace index (RAM $040C >> 1), read off the names record.
 *
 * The record is a keyed table, not an array of records, so it is picked by name the way the
 * native tables are. A palace index the record has no label for is absent here, and the
 * query that reads this answers with the raw index for it.
 */
const modules = import.meta.glob<{ PALACE_INDEX_NAMES?: Record<number, string> }>(
  './records/names/palaces.ts',
  { eager: true },
);

const PALACE_INDEX_NAMES: Readonly<Record<number, string>> =
  Object.values(modules)[0]?.PALACE_INDEX_NAMES ?? {};

export { PALACE_INDEX_NAMES };
