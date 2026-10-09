/* @layer shared-game @kind logic */
const ladderOf = (ladder: readonly number[], startIndex: number, jumps: readonly number[]): number[] => {
  const out = [ladder[startIndex]];
  let index = startIndex;
  for (const jump of jumps) {
    index = Math.min(ladder.length - 1, index + jump);
    out.push(ladder[index]);
  }
  return out;
};

export { ladderOf };
