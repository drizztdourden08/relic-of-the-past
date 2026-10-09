/* @layer shared-game @kind logic */
import { COPY_MULTIPLIERS, DEFAULT_COPY_MULTIPLIER } from './difficulty.data';
import type { CopyMultiplier } from '../difficulty.type';

const asCopyMultiplier = (raw: number): CopyMultiplier => {
  const stepped = Math.trunc(raw);
  const found = COPY_MULTIPLIERS.find((step) => step === stepped);
  return found ?? DEFAULT_COPY_MULTIPLIER;
};

export { asCopyMultiplier };
