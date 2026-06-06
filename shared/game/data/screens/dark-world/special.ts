/* @layer shared-game @kind data */
import type { ScreenDefinition } from '../../../types';

const DW_SPECIAL: ScreenDefinition[] = [
  { id: 'pyramid', name: 'Pyramid', type: 'interior', world: 'dark', location: 'Dark Eastern', area: 'Dark East', roomIndex: 0x62, interior: { kind: 'special' }, tags: ['env:indoor'] },
  { id: 'bottom-of-pyramid', name: 'Bottom of Pyramid', type: 'interior', world: 'dark', location: 'Dark Eastern', area: 'Dark East', roomIndex: 0x62, interior: { kind: 'special' }, tags: ['env:indoor'] },
];

export { DW_SPECIAL };
