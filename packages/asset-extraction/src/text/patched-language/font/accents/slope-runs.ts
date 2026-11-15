/* @layer shared-asset-extraction @kind logic */
const stepSign = (from: number, to: number): number => Math.sign(to - from);

const slopeRuns = (profile: readonly number[]): number[] => {
  const runs: number[] = [];
  for (let index = 1; index < profile.length; index += 1) {
    const sign = stepSign(profile[index - 1] ?? 0, profile[index] ?? 0);
    if (sign !== 0 && runs[runs.length - 1] !== sign) runs.push(sign);
  }
  return runs;
};

export { slopeRuns };
