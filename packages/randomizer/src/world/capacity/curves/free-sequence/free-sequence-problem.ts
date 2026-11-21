/* @layer shared-game @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import { sumOfJumps } from '../sum-of-jumps';

const freeSequenceProblem = (
  jumps: readonly number[], span: number, maxJump = Number.POSITIVE_INFINITY,
): Message | undefined => {
  if (jumps.length === 0) return msg('randomizer:free-sequence.none');
  if (jumps.some((jump) => !Number.isInteger(jump) || jump < 1)) return msg('randomizer:free-sequence.minimum');
  if (jumps.some((jump) => jump > maxJump)) return msg('randomizer:free-sequence.max-jump', { max: maxJump });
  const sum = sumOfJumps(jumps);
  if (sum !== span) return msg('randomizer:free-sequence.sum', { sum, span });
  return undefined;
};

export { freeSequenceProblem };
