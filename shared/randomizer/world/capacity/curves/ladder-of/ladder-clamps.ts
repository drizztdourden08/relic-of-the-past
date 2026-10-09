/* @layer shared-game @kind logic */
import { sumOfJumps } from '../sum-of-jumps';

const ladderClamps = (ladder: readonly number[], startIndex: number, jumps: readonly number[]): boolean =>
  startIndex + sumOfJumps(jumps) > ladder.length - 1;

export { ladderClamps };
