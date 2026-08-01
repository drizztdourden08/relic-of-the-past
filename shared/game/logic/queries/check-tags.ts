/* @layer shared-game @kind logic */
/**
 * Check tag computation — moved from checks/tags.ts (logic split out of data).
 * World/location/area come straight off the check's resolved screen or dungeon
 * record now, instead of matching a screen's display name against regexes.
 */
import type { CheckRecord, CheckTag } from '../../data';
import { getItem, getScreen } from '../../data';

type World = 'light' | 'dark';

const LIGHT_WORLD_DUNGEON_IDS = new Set(['dungeon-001', 'dungeon-002', 'dungeon-003', 'dungeon-004', 'dungeon-005']);

const DUNGEON_TAG_BY_ID: Record<string, CheckTag> = {
  'dungeon-001': 'hyrule_castle',
  'dungeon-002': 'castle_tower',
  'dungeon-003': 'eastern_palace',
  'dungeon-004': 'desert_palace',
  'dungeon-005': 'tower_of_hera',
  'dungeon-006': 'palace_of_darkness',
  'dungeon-007': 'swamp_palace',
  'dungeon-008': 'skull_woods',
  'dungeon-009': 'thieves_town',
  'dungeon-010': 'ice_palace',
  'dungeon-011': 'misery_mire',
  'dungeon-012': 'turtle_rock',
  'dungeon-013': 'ganons_tower',
};

const AREA_TAG_BY_ID: Record<string, CheckTag> = {
  'area-001': 'central_hyrule',
  'area-011': 'hyrule_castle_area',
  'area-010': 'eastern_area',
  'area-016': 'southern_area',
  'area-012': 'kakariko',
  'area-014': 'lost_woods',
  'area-009': 'desert',
  'area-013': 'lake_hylia',
  'area-006': 'dark_north',
  'area-003': 'dark_east',
  'area-007': 'dark_south',
  'area-005': 'dark_mire_area',
  'area-004': 'dark_lake_hylia',
  'area-002': 'dark_death_mountain',
  'area-015': 'skull_woods_area',
  'area-017': 'village_of_outcasts',
};

const worldTag = (check: CheckRecord, screen: ReturnType<typeof getScreen> | undefined): CheckTag => {
  if (screen) return screen.world === 'dark' ? 'dark_world' : 'light_world';
  if (check.dungeonId && !LIGHT_WORLD_DUNGEON_IDS.has(check.dungeonId)) return 'dark_world';
  return 'light_world';
};

/** area-008 (the twin-world mountain area) spans both worlds — the check's own screen breaks the tie. */
const areaTagFor = (areaId: string, world: World): CheckTag | undefined => {
  if (areaId === 'area-008') return world === 'dark' ? 'dark_death_mountain' : 'death_mountain';
  return AREA_TAG_BY_ID[areaId];
};

const computeCheckTags = (check: CheckRecord): CheckTag[] => {
  const tags = new Set<CheckTag>();
  const screen = check.screenId ? getScreen(check.screenId) : undefined;
  const world = worldTag(check, screen);
  tags.add(world);

  if (check.dungeonId) {
    tags.add('dungeon');
    const dungeonTag = DUNGEON_TAG_BY_ID[check.dungeonId];
    if (dungeonTag) tags.add(dungeonTag);
  } else if (screen) {
    if (screen.interiorKind === 'cave') tags.add('cave');
    else if (screen.interiorKind === 'house') tags.add('house');
    else tags.add('overworld');

    const areaTag = areaTagFor(screen.areaId, world === 'dark_world' ? 'dark' : 'light');
    if (areaTag) tags.add(areaTag);
  }

  if (check.kind === 'keyDrop') {
    tags.add('key');
    if (check.vanillaItemIds.some(id => getItem(id).randomizerName.startsWith('Big Key'))) tags.add('big_key');
  }
  if (check.kind === 'boss' || check.kind === 'prize') tags.add('boss_item');
  for (const itemId of check.vanillaItemIds) {
    const name = getItem(itemId).randomizerName;
    if (name.startsWith('Small Key')) tags.add('key');
    if (name.startsWith('Big Key')) tags.add('big_key');
    if (name.startsWith('Compass') || name.startsWith('Map')) tags.add('map_compass');
  }

  const name = check.randomizerName.toLowerCase();
  if (name.includes('map chest') || name.includes('compass chest')) tags.add('map_compass');
  if (name.includes('big key chest')) tags.add('big_key');

  return [...tags];
};

let tagCache: Map<string, CheckTag[]> | null = null;

const getCheckTags = (checks: CheckRecord[]): Map<string, CheckTag[]> => {
  if (tagCache) return tagCache;
  tagCache = new Map(checks.map(c => [c.id, computeCheckTags(c)]));
  return tagCache;
};

const getTagsForCheck = (checkId: string, allChecks: CheckRecord[]): CheckTag[] =>
  getCheckTags(allChecks).get(checkId) ?? [];

export { computeCheckTags, getCheckTags, getTagsForCheck };
