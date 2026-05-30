import type { ScreenDefinition } from '../../../types';

export const LW_HINTS: ScreenDefinition[] = [
  { id: 'fortune-teller-light', name: 'Fortune Teller (Light)', type: 'interior', world: 'light', location: 'Kakariko Village', area: 'Kakariko', roomIndex: 0xE7, interior: { kind: 'hint' }, tags: ['world:light', 'env:inside', 'type:hint', 'area:kakariko'] },
  { id: 'lake-hylia-fortune-teller', name: 'Lake Hylia Fortune Teller', type: 'interior', world: 'light', location: 'Lake Hylia', area: 'Lake Hylia', roomIndex: 0xE7, interior: { kind: 'hint' }, tags: ['world:light', 'env:inside', 'type:hint', 'area:lake_hylia'] },
];
