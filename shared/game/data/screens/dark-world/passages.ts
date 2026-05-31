import type { ScreenDefinition } from '../../../types';

export const DW_PASSAGES: ScreenDefinition[] = [
  { id: 'superbunny-cave-top', name: 'Superbunny Cave (Top)', type: 'interior', world: 'dark', location: 'Dark Death Mountain', area: 'Dark Death Mountain', roomIndex: 0xFD, interior: { kind: 'passage' }, tags: ['env:underground', 'role:connector'] },
  { id: 'superbunny-cave-bottom', name: 'Superbunny Cave (Bottom)', type: 'interior', world: 'dark', location: 'Dark Death Mountain', area: 'Dark Death Mountain', roomIndex: 0xED, interior: { kind: 'passage' }, tags: ['env:underground', 'role:connector', 'loot:chest'] },
];
