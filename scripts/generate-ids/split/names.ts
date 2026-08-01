/**
 * @layer tooling-scripts
 * @kind logic
 *
 * Export-const naming and relative type-import paths for every emitted file.
 * Names are unique across the whole hierarchy, which matters because a world
 * composite imports its dungeon file AND its same-named overworld-area file
 * (light-world has both a hyrule-castle dungeon and a hyrule-castle area).
 */
const WORLD_ABBREV: Record<string, string> = { 'light-world': 'LW', 'dark-world': 'DW' };
const WORLD_FULL: Record<string, string> = { 'light-world': 'LIGHT_WORLD', 'dark-world': 'DARK_WORLD' };

/** Flat kinds name their files outright — no world hierarchy to encode. */
const FLAT_NAMES: Record<string, string> = {
  'checks/light-world': 'LIGHT_WORLD_CHECKS',
  'checks/dark-world': 'DARK_WORLD_CHECKS',
  'checks/dungeons': 'DUNGEON_CHECKS',
  'items/weapons': 'WEAPON_ITEMS',
  'items/equipment': 'EQUIPMENT_ITEMS',
  'items/progression': 'PROGRESSION_ITEMS',
  'items/dungeon-items': 'DUNGEON_ITEMS',
  'items/junk': 'JUNK_ITEMS',
  'actors/npcs': 'NPC_ACTORS',
  'actors/obstacles': 'OBSTACLE_ACTORS',
  'actors/triggers': 'TRIGGER_ACTORS',
};

const screaming = (segments: readonly string[]): string =>
  segments.join('_').toUpperCase().replace(/-/g, '_');

/**
 * `relPath` is relative to shared/game/data, without an extension; a directory
 * path names that directory's composite. `suffix` is the record kind (SCREENS,
 * CONNECTIONS, …).
 */
const constNameFor = (relPath: string, suffix: string): string => {
  const flat = FLAT_NAMES[relPath];
  if (flat) return flat;
  const parts = relPath.split('/');
  if (parts.length === 1) return `ALL_${suffix}`;                       // screens, connections, checks, …
  const world = parts[1];
  if (parts.length === 2) return `${WORLD_FULL[world]}_${suffix}`;       // screens/light-world
  const abbrev = WORLD_ABBREV[world];
  const bucket = parts.slice(2);
  if (bucket[0] === 'dungeons' && bucket.length === 1) return `${abbrev}_DUNGEONS_${suffix}`;
  if (bucket[0] === 'dungeons') return `${abbrev}_DUNGEON_${screaming(bucket.slice(1))}_${suffix}`;
  return `${abbrev}_${screaming(bucket)}_${suffix}`;
};

/** Relative specifier from a file at `relPath` to shared/game/data/types. */
const typeImportFor = (relPath: string): string => {
  const depth = relPath.split('/').length - 1;
  return depth === 0 ? './types' : `${'../'.repeat(depth)}types`;
};

export { constNameFor, typeImportFor };
