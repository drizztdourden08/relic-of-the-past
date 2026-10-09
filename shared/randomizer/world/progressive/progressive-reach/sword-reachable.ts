/* @layer shared-game @kind logic */
import { tickedCountOf } from './ticked-count-of';
import type { ProgressiveSetting } from '../progressive.type';

const swordReachable = (setting: ProgressiveSetting): boolean => tickedCountOf(setting, 'sword') > 0;

export { swordReachable };
