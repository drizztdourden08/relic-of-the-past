/* @layer shared-game @kind data */
import type { ScreenDefinition } from '../../../types';

const LW_HINTS: ScreenDefinition[] = [
  { id: 'fortune-teller-light', name: 'Fortune Teller (Light)', type: 'interior', world: 'light', location: 'Kakariko Village', area: 'Kakariko', roomIndex: 0xE7, interior: { kind: 'hint' }, tags: ['env:indoor'] },
  { id: 'lake-hylia-fortune-teller', name: 'Lake Hylia Fortune Teller', type: 'interior', world: 'light', location: 'Lake Hylia', area: 'Lake Hylia', roomIndex: 0xE7, interior: { kind: 'hint' }, tags: ['env:indoor'] },
];

export { LW_HINTS };
