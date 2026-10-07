/* @layer shared-game @kind logic */
/**
 * The free sequence: the user's own jumps, typed as "4,2,1". Valid when
 * every entry is a positive integer no larger than the family's biggest item
 * and the sum is exactly the span; the length is then the count. An invalid
 * sequence never reaches the pool: the caller falls back to the equal curve
 * and reports it.
 */

/** "4, 2,1" → [4, 2, 1]; any non-integer token ⇒ undefined; blank ⇒ []. */
const parseFreeJumps = (text: string): number[] | undefined => {
  const tokens = text.split(',').map((token) => token.trim()).filter((token) => token !== '');
  const jumps: number[] = [];
  for (const token of tokens) {
    if (!/^\d+$/.test(token)) return undefined;
    jumps.push(Number.parseInt(token, 10));
  }
  return jumps;
};

const formatFreeJumps = (jumps: readonly number[]): string => jumps.join(',');

const sumOf = (jumps: readonly number[]): number => jumps.reduce((sum, jump) => sum + jump, 0);

/** Every jump a positive integer under the cap, at least one of them, Σ = span. */
const isValidFreeSequence = (jumps: readonly number[], span: number, maxJump = Number.POSITIVE_INFINITY): boolean =>
  jumps.length > 0
  && jumps.every((jump) => Number.isInteger(jump) && jump >= 1 && jump <= maxJump)
  && sumOf(jumps) === span;

/** Why a sequence is rejected, for the editor's readout; undefined when valid. */
const freeSequenceProblem = (
  jumps: readonly number[], span: number, maxJump = Number.POSITIVE_INFINITY,
): string | undefined => {
  if (jumps.length === 0) return 'no jumps';
  if (jumps.some((jump) => !Number.isInteger(jump) || jump < 1)) return 'every jump must be at least 1';
  if (jumps.some((jump) => jump > maxJump)) return `no item carries more than ${maxJump}`;
  const sum = sumOf(jumps);
  if (sum !== span) return `sum ${sum} is not the span ${span}`;
  return undefined;
};

export { formatFreeJumps, freeSequenceProblem, isValidFreeSequence, parseFreeJumps };
