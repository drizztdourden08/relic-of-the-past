/* @layer shared-game @kind logic */
const sumOfJumps = (jumps: readonly number[]): number => jumps.reduce((sum, jump) => sum + jump, 0);

export { sumOfJumps };
