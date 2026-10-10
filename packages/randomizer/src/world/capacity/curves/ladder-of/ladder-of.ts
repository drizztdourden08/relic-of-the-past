/* @layer shared-game @kind logic */
import { itemAt } from '../../../../checked-access';

const ladderOf = (ladder: readonly number[], startIndex: number, jumps: readonly number[]): number[] => {
  const out = [itemAt(ladder, startIndex)];
  let index = startIndex;
  for (const jump of jumps) {
    index = Math.min(ladder.length - 1, index + jump);
    out.push(itemAt(ladder, index));
  }
  return out;
};

export { ladderOf };
