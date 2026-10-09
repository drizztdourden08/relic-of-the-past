/* @layer renderer-lib @kind logic */
const intervalPoints = (atSeconds: number[]): number[] =>
  [...new Set(atSeconds.filter((s) => Number.isFinite(s) && s >= 0))].sort((a, b) => a - b);

export { intervalPoints };
