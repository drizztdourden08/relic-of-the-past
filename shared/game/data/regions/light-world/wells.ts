import type { ScreenDefinition } from '../../../types';

export const LW_WELLS: ScreenDefinition[] = [
  { id: 'kakariko-well-top', name: 'Kakariko Well (top)', type: 'interior', world: 'light', location: 'Kakariko Village', area: 'Kakariko', roomIndex: 0x011F, interior: { kind: 'well' }, tags: ['world:light', 'env:underground', 'type:well', 'area:kakariko', 'role:drop_zone'] },
  { id: 'kakariko-well-bottom', name: 'Kakariko Well (bottom)', type: 'interior', world: 'light', location: 'Kakariko Village', area: 'Kakariko', roomIndex: 0x0123, interior: { kind: 'well' }, tags: ['world:light', 'env:underground', 'type:well', 'area:kakariko', 'role:treasure'] },
];
