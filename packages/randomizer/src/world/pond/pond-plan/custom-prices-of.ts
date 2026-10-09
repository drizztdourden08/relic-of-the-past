/* @layer shared-game @kind logic */
import { jumpsOf } from '../../capacity/curves/jumps-of';
import { ladderOf } from '../../capacity/curves/ladder-of';
import { POND_PRICE_LADDER } from '../pond-ladder.constants';
import { rungOf } from './rung-of';
import type { PondCustomSetting } from '../pond-profile.type';

const stretchOver = (prices: readonly number[], wanted: number): number[] =>
  (prices.length >= wanted
    ? [...prices]
    : Array.from({ length: wanted }, (_, index) => prices[Math.floor((index * prices.length) / wanted)]));

const customPricesOf = (setting: PondCustomSetting): number[] => {
  const low = rungOf(setting.start);
  const span = Math.max(0, rungOf(setting.max) - low);
  const wanted = Math.max(1, Math.min(setting.throws, POND_PRICE_LADDER.length));
  if (span === 0 || wanted === 1) return Array<number>(wanted).fill(POND_PRICE_LADDER[low]);
  return stretchOver(ladderOf(POND_PRICE_LADDER, low, jumpsOf(setting.shape, wanted - 1, span)), wanted);
};

export { customPricesOf };
