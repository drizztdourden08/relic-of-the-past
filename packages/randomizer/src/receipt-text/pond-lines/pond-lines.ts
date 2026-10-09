/* @layer shared-game @kind logic */
import { POND_AWARD_LAST_LINE, POND_AWARD_MORE_LINE, POND_CLOSED_LINE } from './pond-lines.constants';
import { pondConsolationLine } from './pond-consolation-line';
import { pondPriceLine } from './pond-price-line';
import type { PondPlan } from '../../world/pond/pond-profile.type';
import type { PondLineSet } from './pond-lines.type';

const distinct = (amounts: readonly number[], keep: (amount: number) => boolean): number[] =>
  [...new Set(amounts.filter(keep))];

const pondLinesOf = (plan: PondPlan): PondLineSet => {
  const prices = distinct(plan.throws.map((entry) => entry.price), () => true);
  const refunds = distinct(plan.throws.map((entry) => entry.refund), (refund) => refund > 0);
  return {
    prices,
    refunds,
    lines: [
      ...prices.map(pondPriceLine), ...refunds.map(pondConsolationLine),
      POND_AWARD_MORE_LINE, POND_AWARD_LAST_LINE, POND_CLOSED_LINE,
    ],
  };
};

export { pondLinesOf };
