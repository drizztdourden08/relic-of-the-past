/* @layer shared-game @kind logic */
import type { CheckRecord } from '../../../data';
import { getArea, getDungeon, getScreen, hasTagKey, labelOf } from '../../../data';
import { OUTSIDE_SWEEP } from './check-grouping.constants';
import type { GroupDimension, RunContext } from './check-grouping.type';

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

const worldOfDungeon = (dungeonId: NonNullable<CheckRecord['dungeonId']>): string =>
  getScreen(getDungeon(dungeonId).roomScreenIds[0]).world;

const getGroupValue = (check: CheckRecord, dimension: GroupDimension, run?: RunContext): string => {
  const screen = check.screenId ? getScreen(check.screenId) : undefined;
  switch (dimension) {
    case 'world': {
      const world = screen?.world ?? (check.dungeonId ? worldOfDungeon(check.dungeonId) : 'light');
      return world === 'dark' ? 'Dark World' : 'Light World';
    }
    case 'area':
      return areaLabel(check);
    case 'location':
      if (check.dungeonId) return 'Dungeon';
      if (screen?.interiorKind === 'cave') return 'Cave';
      if (screen?.interiorKind === 'house') return 'House';
      return 'Overworld';
    case 'dungeon':
      return check.dungeonId ? getDungeon(check.dungeonId).name : 'Overworld';
    case 'screen': {
      if (!screen) return 'Unknown';
      return screen.name;
    }
    case 'type':
      return labelOf('check-kind', check.kind) ?? check.kind;
    case 'content': {
      const tags = check.tags ?? [];
      if (hasTagKey(tags, 'content:key')) return 'Keys';
      if (hasTagKey(tags, 'content:big-key')) return 'Big Keys';
      if (hasTagKey(tags, 'content:map-compass')) return 'Map/Compass';
      if (hasTagKey(tags, 'content:boss-item')) return 'Boss Items';
      return 'Other';
    }
    case 'sphere': {
      const sphere = run?.spheres?.get(check.id);
      return sphere === undefined ? OUTSIDE_SWEEP : `Sphere ${sphere}`;
    }
  }
};

export { getGroupValue };
