/* @layer shared-game @kind logic */
import { tickedIndexesOf } from './ticked-indexes-of';
import type { ProgressiveSetting } from '../progressive.type';

const beamSwordReachable = (setting: ProgressiveSetting): boolean =>
  tickedIndexesOf(setting, 'sword').some((index) => index >= 1);

export { beamSwordReachable };
