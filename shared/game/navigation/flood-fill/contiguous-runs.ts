/* @layer shared-game @kind logic */
const contiguousRuns = (positions: number[]): number[][] => {
  const runs: number[][] = [];
  let runStart = 0;
  for (let i = 1; i <= positions.length; i++) {
    if (i === positions.length || positions[i] !== positions[i - 1] + 1) {
      runs.push(positions.slice(runStart, i));
      runStart = i;
    }
  }
  return runs;
};

export { contiguousRuns };
