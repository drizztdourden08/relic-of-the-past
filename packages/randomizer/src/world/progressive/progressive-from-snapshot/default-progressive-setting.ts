/* @layer shared-game @kind logic */
import { recordBy } from '../../../keyed-record';
import { DEFAULT_PROGRESSIVE_SETTING, PROGRESSIVE_FAMILIES } from '../progressive-families.constants';
import type { ProgressiveSetting } from '../progressive.type';

const defaultProgressiveSetting = (): ProgressiveSetting =>
  recordBy(PROGRESSIVE_FAMILIES, (family) => family.id, (family) => [...(DEFAULT_PROGRESSIVE_SETTING[family.id])]);

export { defaultProgressiveSetting };
