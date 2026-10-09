/* @layer shared-game @kind logic */
import { sumOfJumps } from '../sum-of-jumps';

const isValidFreeSequence = (jumps: readonly number[], span: number, maxJump = Number.POSITIVE_INFINITY): boolean =>
  jumps.length > 0
  && jumps.every((jump) => Number.isInteger(jump) && jump >= 1 && jump <= maxJump)
  && sumOfJumps(jumps) === span;

export { isValidFreeSequence };
