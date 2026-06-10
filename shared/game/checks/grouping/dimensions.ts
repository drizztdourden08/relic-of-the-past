/* @layer shared-game @kind logic */
/**
 * Grouping dimension catalog + per-dimension value resolution for a check.
 */
import type { CheckDefinition } from '../../types';
import type { CheckTag } from '../tags';
import { TAG_DEFINITIONS } from '../tags';
import type { GroupDimension, GroupDimensionDef } from './types';

const GROUP_DIMENSIONS: GroupDimensionDef[] = [
  { id: 'world', label: 'World', description: 'Light World / Dark World' },
  { id: 'area', label: 'Area', description: 'Geographic region (Kakariko, Death Mountain, etc.)' },
  { id: 'location', label: 'Location Type', description: 'Cave, House, Dungeon, Overworld' },
  { id: 'dungeon', label: 'Dungeon', description: 'Specific dungeon' },
  { id: 'screen', label: 'Screen', description: 'Detailed sub-location' },
  { id: 'type', label: 'Check Type', description: 'Chest, NPC, Key Drop, Boss, etc.' },
  { id: 'content', label: 'Content', description: 'Key, Map/Compass, Boss Item, etc.' },
];

const getGroupValue = (check: CheckDefinition, dimension: GroupDimension, tags: CheckTag[]): string => {
  switch (dimension) {
    case 'world':
      return tags.includes('dark_world') ? 'Dark World' : 'Light World';
    case 'area': {
      const areaTags = tags.filter(t =>
        TAG_DEFINITIONS.find(d => d.id === t && d.category === 'area')
      );
      if (areaTags.length > 0) {
        const def = TAG_DEFINITIONS.find(d => d.id === areaTags[0]);
        return def?.label ?? 'Other';
      }
      // For dungeon checks, use the dungeon name as area
      if (check.dungeon) return check.dungeon;
      return 'Other';
    }
    case 'location': {
      if (tags.includes('dungeon')) return 'Dungeon';
      if (tags.includes('cave')) return 'Cave';
      if (tags.includes('house')) return 'House';
      return 'Overworld';
    }
    case 'dungeon':
      return check.dungeon ?? 'Overworld';
    case 'screen':
      return check.screen;
    case 'type':
      return check.type.charAt(0).toUpperCase() + check.type.slice(1);
    case 'content': {
      if (tags.includes('key')) return 'Keys';
      if (tags.includes('big_key')) return 'Big Keys';
      if (tags.includes('map_compass')) return 'Map/Compass';
      if (tags.includes('boss_item')) return 'Boss Items';
      return 'Other';
    }
  }
};

export { GROUP_DIMENSIONS, getGroupValue };
