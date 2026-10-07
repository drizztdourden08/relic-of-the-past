/* @layer shared-game @kind logic */
/**
 * The preview: cumulative ladder values, one entry per jump after the start.
 * Walks the family's own ladder, so every value shown is a legal tier. A
 * clamp at the top means a surplus step (the reference's two-tier item at
 * the end of its ladder pays the pond consolation), so a Custom ladder never
 * clamps because its jumps sum exactly to the span.
 */

const ladderOf = (ladder: readonly number[], startIndex: number, jumps: readonly number[]): number[] => {
  const out = [ladder[startIndex]];
  let index = startIndex;
  for (const jump of jumps) {
    index = Math.min(ladder.length - 1, index + jump);
    out.push(ladder[index]);
  }
  return out;
};

/** True when a jump ran past the top of the ladder (a surplus step). */
const ladderClamps = (ladder: readonly number[], startIndex: number, jumps: readonly number[]): boolean =>
  startIndex + jumps.reduce((sum, jump) => sum + jump, 0) > ladder.length - 1;

export { ladderClamps, ladderOf };
