import type { ScreenDefinition } from '../../../types';

export const DW_SPECIAL: ScreenDefinition[] = [
  { id: 'pyramid', name: 'Pyramid', type: 'interior', world: 'dark', location: 'Dark Eastern', area: 'Dark East', roomIndex: 0x62, interior: { kind: 'special' }, tags: ['world:dark', 'env:inside', 'type:special', 'area:dark_east'] },
  { id: 'bottom-of-pyramid', name: 'Bottom of Pyramid', type: 'interior', world: 'dark', location: 'Dark Eastern', area: 'Dark East', roomIndex: 0x62, interior: { kind: 'special' }, tags: ['world:dark', 'env:inside', 'type:special', 'area:dark_east'] },
];
