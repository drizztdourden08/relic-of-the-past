/* @layer shared-game @kind logic */
import { tickedIndexesOf } from './ticked-indexes-of';
import type { ProgressiveFamilyId, ProgressiveSetting } from '../progressive.type';

const tickedCountOf = (setting: ProgressiveSetting, family: ProgressiveFamilyId): number =>
  tickedIndexesOf(setting, family).length;

export { tickedCountOf };
