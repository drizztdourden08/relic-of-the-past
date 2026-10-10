/* @layer shared-game @kind logic */
import { recordBy } from '../../../keyed-record';
import { PROGRESSIVE_FAMILIES } from '../../progressive/progressive-families.constants';
import { DEFAULT_COPY_MULTIPLIER, asCopyMultiplier } from '../difficulty';
import { difficultyCopiesKeyOf } from '../difficulty-option-keys';
import type { OptionValues } from '../../options.type';
import type { CopyMultiplier, CopyMultiplierSetting } from '../difficulty.type';

const multiplierAt = (values: OptionValues, key: string): CopyMultiplier => {
  const raw = values[key];
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return DEFAULT_COPY_MULTIPLIER;
  return asCopyMultiplier(raw);
};

const copiesOfValues = (values: OptionValues): CopyMultiplierSetting =>
  recordBy(PROGRESSIVE_FAMILIES, (family) => family.id, (family) => multiplierAt(values, difficultyCopiesKeyOf(family.id)));

export { copiesOfValues };
