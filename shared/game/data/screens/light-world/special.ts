/* @layer shared-game @kind data */
import type { ScreenDefinition } from '../../../types';

const LW_SPECIAL: ScreenDefinition[] = [
  { id: 'menu', name: 'Menu / Save & Quit', type: 'overworld', world: 'light', location: 'Menu', area: '', overworld: { gridX: 0, gridY: 0 }, tags: ['role:spawn'] },
];

export { LW_SPECIAL };
