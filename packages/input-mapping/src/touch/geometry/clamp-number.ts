/* @layer shared-input @kind logic */

/** Limits a number to the inclusive range min..max. */
const clampNumber = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export { clampNumber };
