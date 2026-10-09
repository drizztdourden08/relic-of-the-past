/* @layer shared-game @kind logic */
import { PROGRESSIVE_FAMILIES } from '../../progressive/progressive-families.data';
import { DEFAULT_COPY_MULTIPLIER, asCopyMultiplier } from '../difficulty.data';
import { difficultyCopiesKeyOf } from '../difficulty-option-keys';
import type { OptionValues } from '../../options.type';
import type { CopyMultiplier, CopyMultiplierSetting } from '../difficulty.type';

const multiplierAt = (values: OptionValues, key: string): CopyMultiplier => {
  const raw = values[key];
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return DEFAULT_COPY_MULTIPLIER;
  return asCopyMultiplier(raw);
};

const copiesOfValues = (values: OptionValues): CopyMultiplierSetting =>
  Object.fromEntries(PROGRESSIVE_FAMILIES.map((family) =>
    [family.id, multiplierAt(values, difficultyCopiesKeyOf(family.id))])) as unknown as CopyMultiplierSetting;

export { copiesOfValues };
