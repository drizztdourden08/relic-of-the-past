/* @layer shared-game @kind data */
import type { ScreenDefinition } from '../../../types';

const LW_GAMBLE: ScreenDefinition[] = [
  { id: 'kakariko-gamble-game', name: 'Kakariko Gamble Game', type: 'interior', world: 'light', location: 'Kakariko Village', area: 'Kakariko', roomIndex: 0x011B, interior: { kind: 'gamble' }, tags: ['env:indoor'] },
  { id: 'lost-woods-gamble', name: 'Lost Woods Gamble', type: 'interior', world: 'light', location: 'Lost Woods', area: 'Lost Woods', roomIndex: 0x010C, interior: { kind: 'gamble' }, tags: ['env:underground'] },
];

export { LW_GAMBLE };
