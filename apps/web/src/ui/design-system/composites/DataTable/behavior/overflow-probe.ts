/* @layer renderer-components @kind logic */
/**
 * Whether a grow column has any space to expand into. A table that already has
 * a grow column reports how wide it is, not how wide it needs to be, so the
 * probe puts flexible columns back at content width before comparing. That
 * keeps the two modes from switching each other on. Pure arithmetic; the hook
 * reads the numbers off the DOM.
 */

/** Sub-pixel layout rounding is not an overflow, so a hair of slack is allowed. */
const OVERFLOW_TOLERANCE = 1;

interface OverflowProbe {
  /** Total width the grid is laying out right now, flexible tracks included. */
  scrollWidth: number;
  /** How much of that is visible without scrolling sideways. */
  clientWidth: number;
  /** What the flexible columns are currently rendered at, added up. */
  flexibleRendered: number;
  /** What those same columns would take at their content width, added up. */
  flexibleFitted: number;
}

/** The width the table wants with nothing claiming slack. Same in every mode. */
const naturalWidth = (probe: OverflowProbe): number =>
  probe.scrollWidth - probe.flexibleRendered + probe.flexibleFitted;

const isOverflowing = (probe: OverflowProbe): boolean =>
  naturalWidth(probe) > probe.clientWidth + OVERFLOW_TOLERANCE;

/** Widths grow columns render at while there is no slack, keyed by path; null when they can fill. Null, not an empty map, on purpose. */
type GrowFallback = ReadonlyMap<string, number> | null;

/** Two fallbacks that would render identically, so a re-measure can keep the old one. */
const sameFallback = (left: GrowFallback, right: GrowFallback): boolean => {
  if (left === null || right === null) return left === right;
  if (left.size !== right.size) return false;
  return [...left].every(([path, width]) => right.get(path) === width);
};

export { OVERFLOW_TOLERANCE, isOverflowing, naturalWidth, sameFallback };
export type { GrowFallback, OverflowProbe };
