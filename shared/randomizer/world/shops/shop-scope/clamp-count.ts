/* @layer shared-game @kind logic */
const clampCount = (count: number, ceiling: number): number =>
  Math.min(ceiling, Math.max(0, Math.trunc(Number.isFinite(count) ? count : 0)));

export { clampCount };
