/* @layer shared-game @kind logic */
/**
 * Turns a glob of record modules into one flat list.
 *
 * This is what makes the dataset optional. The record files live under
 * `records/`, which is not part of this repository — it is copied in from the
 * private companion repo by `npm run vault:sync`. A static `import` of a path
 * that is not on disk fails the build; `import.meta.glob` resolves to an empty
 * object instead, so a checkout without access seeds an empty registry and every
 * getter falls through to the facade's stand-in record.
 *
 * Every module is scanned for array exports rather than one agreed name, because
 * the record files each name their own collection (`AREAS`, `NPC_ACTORS`,
 * `LIGHT_WORLD_SCREENS`). Vite sorts glob keys by path, so the seeding order is
 * stable across runs.
 */

/** A record module exports one or more arrays and nothing else that is an array. */
type RecordModule = Record<string, unknown>;

const collectRecords = <T>(modules: Record<string, unknown>): T[] => {
  const collected: T[] = [];
  for (const module of Object.values(modules)) {
    for (const exported of Object.values(module as RecordModule)) {
      if (Array.isArray(exported)) collected.push(...(exported as T[]));
    }
  }
  return collected;
};

export { collectRecords };
