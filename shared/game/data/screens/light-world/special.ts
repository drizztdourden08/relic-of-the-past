import type { ScreenDefinition } from '../../../types';

export const LW_SPECIAL: ScreenDefinition[] = [
  { id: 'menu', name: 'Menu / Save & Quit', type: 'overworld', world: 'light', location: 'Menu', area: '', overworld: { gridX: 0, gridY: 0 }, tags: ['role:spawn'] },
  { id: 'chris-houlihan-room', name: 'Chris Houlihan Room', type: 'interior', world: 'light', location: 'Central Hyrule', area: 'Central Hyrule', roomIndex: 0x0C, interior: { kind: 'special' }, tags: ['env:underground', 'loot:chest'] },
];
