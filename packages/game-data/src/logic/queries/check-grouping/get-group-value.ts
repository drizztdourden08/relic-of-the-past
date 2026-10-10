/* @layer shared-game @kind logic */
import type { CheckRecord } from '../../../data';
import { getArea, getDungeon, getScreen, hasTagKey, labelOf } from '../../../data';
import { OUTSIDE_SWEEP } from './check-grouping.constants';
import type { GroupDimension, GroupValueOf as ValueOf, RunContext } from './check-grouping.type';

const areaLabel = (check: CheckRecord): string => {
  if (check.screenId) {
    const screen = getScreen(check.screenId);
    const area = getArea(screen.areaId);
    if (area.world === 'both') return screen.world === 'dark' ? `Dark ${area.name}` : area.name;
    return area.name;
  }
  if (check.dungeonId) return getDungeon(check.dungeonId).name;
  return 'Other';
};

const worldOfDungeon = (dungeonId: NonNullable<CheckRecord['dungeonId']>): string => {
  const [firstRoom] = getDungeon(dungeonId).roomScreenIds;
  if (firstRoom === undefined) throw new Error(`dungeon ${dungeonId} has no rooms`);
  return getScreen(firstRoom).world;
};

const worldValue: ValueOf = (check, screen) => {
  const world = screen?.world ?? (check.dungeonId ? worldOfDungeon(check.dungeonId) : 'light');
  return world === 'dark' ? 'Dark World' : 'Light World';
};

const locationValue: ValueOf = (check, screen) => {
  if (check.dungeonId) return 'Dungeon';
  if (screen?.interiorKind === 'cave') return 'Cave';
  if (screen?.interiorKind === 'house') return 'House';
  return 'Overworld';
};

const contentValue: ValueOf = (check) => {
  const tags = check.tags ?? [];
  if (hasTagKey(tags, 'content:key')) return 'Keys';
  if (hasTagKey(tags, 'content:big-key')) return 'Big Keys';
  if (hasTagKey(tags, 'content:map-compass')) return 'Map/Compass';
  if (hasTagKey(tags, 'content:boss-item')) return 'Boss Items';
  return 'Other';
};

const sphereValue: ValueOf = (check, _screen, run) => {
  const sphere = run?.spheres?.get(check.id);
  return sphere === undefined ? OUTSIDE_SWEEP : `Sphere ${sphere}`;
};

const valueByDimension: Record<GroupDimension, ValueOf> = {
  world: worldValue,
  area: (check) => areaLabel(check),
  location: locationValue,
  dungeon: (check) => (check.dungeonId ? getDungeon(check.dungeonId).name : 'Overworld'),
  screen: (_check, screen) => screen?.name ?? 'Unknown',
  type: (check) => labelOf('check-kind', check.kind) ?? check.kind,
  content: contentValue,
  sphere: sphereValue,
};

const getGroupValue = (check: CheckRecord, dimension: GroupDimension, run?: RunContext): string => {
  const screen = check.screenId ? getScreen(check.screenId) : undefined;
  return valueByDimension[dimension](check, screen, run);
};

export { getGroupValue };
