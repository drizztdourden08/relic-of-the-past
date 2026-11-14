/* @layer shared-input @kind logic */

const clampNumber = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export { clampNumber };
