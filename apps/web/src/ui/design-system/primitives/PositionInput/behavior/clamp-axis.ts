/* @layer renderer-components @kind logic */
/**
 * The bound rules, as pure functions.
 *
 * One convention throughout, matching the spinner in NumberInput: a value below
 * the floor becomes the floor, a value above the ceiling becomes the ceiling,
 * and the result is trimmed to six decimals so repeated stepping cannot drift
 * (0.1 + 0.2 stays 0.3). An absent bound means that end is open.
 */
import type { PositionAxis, PositionValue } from '../PositionInput.type';

/** Matches the rounding NumberInput applies to a stepped value. */
const PRECISION = 6;

const trim = (value: number): number => Number(value.toFixed(PRECISION));

/** True when the value sits inside whichever bounds the axis actually declares. */
const isWithinAxis = (value: number, axis: PositionAxis = {}): boolean => {
  const { min, max } = axis;
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
};

/** True when the value is a real number AND inside the bounds, which is what onChange requires. */
const isValidForAxis = (value: number, axis: PositionAxis = {}): boolean =>
  Number.isFinite(value) && isWithinAxis(value, axis);

/**
 * Pulls a value inside the axis. Anything that is not a real number falls back
 * to `fallback` (the last value known to be good). If that is not a real number
 * either, it falls back to the floor, or to zero when there is no floor.
 */
const clampAxis = (value: number, axis: PositionAxis = {}, fallback = 0): number => {
  const { min, max } = axis;
  const usable = Number.isFinite(value) ? value : fallback;
  let next = Number.isFinite(usable) ? usable : (min ?? 0);
  if (min !== undefined && next < min) next = min;
  if (max !== undefined && next > max) next = max;
  return trim(next);
};

/**
 * Both axes at once, for a caller holding a stored pair that may predate the
 * bounds it is now being edited under.
 */
const clampPosition = (
  value: PositionValue,
  x: PositionAxis = {},
  y: PositionAxis = {},
): PositionValue => ({
  x: clampAxis(value.x, x, 0),
  y: clampAxis(value.y, y, 0),
});

export { clampAxis, clampPosition, isValidForAxis, isWithinAxis };
