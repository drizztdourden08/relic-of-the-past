/* @layer shared-game @kind logic */
import { sumOfJumps } from '../sum-of-jumps';

const freeSequenceProblem = (
  jumps: readonly number[], span: number, maxJump = Number.POSITIVE_INFINITY,
): string | undefined => {
  if (jumps.length === 0) return 'no jumps';
  if (jumps.some((jump) => !Number.isInteger(jump) || jump < 1)) return 'every jump must be at least 1';
  if (jumps.some((jump) => jump > maxJump)) return `no item carries more than ${maxJump}`;
  const sum = sumOfJumps(jumps);
  if (sum !== span) return `sum ${sum} is not the span ${span}`;
  return undefined;
};

export { freeSequenceProblem };
