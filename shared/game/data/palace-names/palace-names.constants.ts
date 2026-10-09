/* @layer shared-game-data @kind constants */
const modules = import.meta.glob<{ PALACE_INDEX_NAMES?: Record<number, string> }>(
  '../records/names/palaces.ts',
  { eager: true },
);

const PALACE_INDEX_NAMES: Readonly<Record<number, string>> =
  Object.values(modules)[0]?.PALACE_INDEX_NAMES ?? {};

export { PALACE_INDEX_NAMES };
