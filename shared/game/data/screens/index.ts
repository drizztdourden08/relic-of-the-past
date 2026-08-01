/* @layer shared-game @kind data */
import type { ScreenRecord } from '../types';
import { DARK_WORLD_SCREENS } from './dark-world';
import { LIGHT_WORLD_SCREENS } from './light-world';

const ALL_SCREENS: ScreenRecord[] = [
  ...DARK_WORLD_SCREENS,
  ...LIGHT_WORLD_SCREENS,
];

export { ALL_SCREENS };
