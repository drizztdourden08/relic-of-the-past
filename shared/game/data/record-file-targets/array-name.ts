/* @layer shared-game @kind logic */
/**
 * The name of the array a record file exports, from the path alone: the world it sits under,
 * then the place, then the collection. A file created for a record the tree has no file for
 * yet is named by this, so the loader's glob picks it up like any other.
 */

/** The array each collection's files name their records after. */
const ARRAY_SUFFIX: Readonly<Record<string, string>> = {
  screens: 'SCREENS', connections: 'CONNECTIONS', checks: 'CHECKS', items: 'ITEMS',
  actors: 'ACTORS', dungeons: 'DUNGEON', areas: 'AREAS', locations: 'LOCATIONS',
  regions: 'REGIONS',
};

const recordArrayName = (relativePath: string): string | null => {
  // The events tree names its arrays after the events themselves (STORY_EVENTS, and one
  // per dungeon), because a number block is what those files hold, not a place.
  if (relativePath.startsWith('checks/events/')) return null;
  const parts = relativePath.replace(/\.ts$/, '').split('/');
  const collection = parts.shift() as string;
  let suffix = ARRAY_SUFFIX[collection];
  if (!suffix) return null;
  if (parts[0] === 'dungeon-items') {
    parts.shift();
    suffix = 'DUNGEON_ITEMS';
  }
  const prefix = parts[0] === 'light-world' || parts[0] === 'dark-world'
    ? `${parts.shift() === 'light-world' ? 'LW' : 'DW'}_`
    : '';
  const place = parts.join('_').replace(/-/g, '_').toUpperCase();
  return `${prefix}${place ? `${place}_` : ''}${suffix}`;
};

export { recordArrayName };
