/* @layer shared-game @kind logic */
const clamped = (value: number, low: number, high: number, fallback: number): number =>
  (Number.isFinite(value) ? Math.min(high, Math.max(low, Math.floor(value))) : fallback);

export { clamped };
