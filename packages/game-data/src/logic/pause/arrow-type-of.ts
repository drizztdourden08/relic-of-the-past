/* @layer shared-game @kind logic */
import { ARROW_LADDER, ARROW_TYPE_STEP, NO_ARROW_TYPE } from './gear-tiers.constants';
import { maxGearTier } from './max-gear-tier';

const arrowTypeOf = (bowValue: number): number => {
  if (!Number.isInteger(bowValue) || bowValue <= 0) return NO_ARROW_TYPE;
  return Math.min(Math.floor((bowValue - 1) / ARROW_TYPE_STEP), maxGearTier(ARROW_LADDER));
};

export { arrowTypeOf };
