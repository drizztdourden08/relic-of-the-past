/* @layer shared-game @kind logic */
import { DEFAULT_HEART_CAP, asHeartCap } from '../difficulty';
import { HEART_CAP_KEY } from '../difficulty-option-keys';
import type { OptionValues } from '../../options.type';

const heartCapOfValues = (values: OptionValues): number => {
  const raw = values[HEART_CAP_KEY];
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return DEFAULT_HEART_CAP;
  return asHeartCap(raw);
};

export { heartCapOfValues };
