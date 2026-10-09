/* @layer shared-game @kind logic */
import { DEFAULT_PROGRESSIVE_SETTING } from '../progressive-families.constants';
import type { ProgressiveFamilyId } from '../progressive.type';

const defaultTickOf = (family: ProgressiveFamilyId, index: number): boolean =>
  DEFAULT_PROGRESSIVE_SETTING[family][index] ?? true;

export { defaultTickOf };
