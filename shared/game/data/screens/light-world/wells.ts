import type { ScreenDefinition } from '../../../types';

const LW_WELLS: ScreenDefinition[] = [
  { id: 'kakariko-well-top', name: 'Kakariko Well (top)', type: 'interior', world: 'light', location: 'Kakariko Village', area: 'Kakariko', roomIndex: 0x011F, interior: { kind: 'well' }, tags: ['env:underground', 'traverse:fall'] },
  { id: 'kakariko-well-bottom', name: 'Kakariko Well (bottom)', type: 'interior', world: 'light', location: 'Kakariko Village', area: 'Kakariko', roomIndex: 0x0123, interior: { kind: 'well' }, tags: ['env:underground', 'loot:chest'] },
];

export { LW_WELLS };
