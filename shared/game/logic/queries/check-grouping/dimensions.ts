/* @layer shared-game @kind logic */
/**
 * Grouping dimension catalog + per-dimension value resolution for a check.
 * World/area/location/dungeon read ScreenRecord/AreaRecord/DungeonRecord
 * directly. They used to go through a precomputed CheckTag, which only ever
 * duplicated these same fields.
 */
import type { CheckRecord } from '../../../data';
import { getArea, getDungeon, getScreen, hasTagKey, labelOf } from '../../../data';
import type { GroupDimension, GroupDimensionDef } from './types';

const GROUP_DIMENSIONS: GroupDimensionDef[] = [
  { id: 'world', label: 'World', description: 'Light World / Dark World' },
  { id: 'area', label: 'Area', description: 'Geographic region of the overworld or dungeon' },
  { id: 'location', label: 'Location Type', description: 'Cave, House, Dungeon, Overworld' },
  { id: 'dungeon', label: 'Dungeon', description: 'Specific dungeon' },
  { id: 'screen', label: 'Screen', description: 'Detailed sub-location' },
  { id: 'type', label: 'Check Type', description: 'Chest, NPC, Key Drop, Boss, etc.' },
  { id: 'content', label: 'Content', description: 'Key, Map/Compass, Boss Item, etc.' },
];

/** Death Mountain (area-008) is the one area that spans both worlds, so the check's own screen breaks the tie. */
const areaLabel = (check: CheckRecord): string => {
  if (check.screenId) {
    const screen = getScreen(check.screenId);
    const area = getArea(screen.areaId);
    if (area.world === 'both') return screen.world === 'dark' ? `Dark ${area.randomizerName}` : area.randomizerName;
    return area.randomizerName;
  }
  if (check.dungeonId) return getDungeon(check.dungeonId).randomizerName;
  return 'Other';
};

const getGroupValue = (check: CheckRecord, dimension: GroupDimension): string => {
  const screen = check.screenId ? getScreen(check.screenId) : undefined;
  switch (dimension) {
    case 'world':
      return screen?.world === 'dark' ? 'Dark World' : 'Light World';
    case 'area':
      return areaLabel(check);
    case 'location':
      if (check.dungeonId) return 'Dungeon';
      if (screen?.interiorKind === 'cave') return 'Cave';
      if (screen?.interiorKind === 'house') return 'House';
      return 'Overworld';
    case 'dungeon':
      return check.dungeonId ? getDungeon(check.dungeonId).randomizerName : 'Overworld';
    case 'screen': {
      if (!screen) return 'Unknown';
      return screen.vanillaName ?? screen.randomizerName;
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
  }
};

export { GROUP_DIMENSIONS, getGroupValue };
