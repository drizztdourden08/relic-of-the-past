/* @layer renderer-components @kind logic */
/**
 * Whether "expand to available space" has any available space to expand into.
 *
 * A `1fr` track only means "take what is left" while something IS left. Once the
 * columns need more room than the scroller can show, there is nothing left to
 * take and the flexible track stops saying anything useful — so the answer to
 * "is this table overflowing?" decides whether a grow column can be honoured.
 *
 * The catch is that asking the question of a table that already has a grow
 * column in it answers a different question: the flexible track has by then
 * stretched to whatever it could, so the measured total says how wide the table
 * IS, not how wide it needs to be. Hence the probe puts the flexible columns
 * back at their content width before comparing — the same total either way,
 * whichever mode the table happens to be rendering in. That is what keeps the
 * two modes from taking turns switching each other on.
 *
 * Pure arithmetic on four numbers, so the rule is assertable without a browser;
 * reading those numbers off the DOM is the hook's job.
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

/** The width the table wants with nothing claiming slack — mode-independent. */
const naturalWidth = (probe: OverflowProbe): number =>
  probe.scrollWidth - probe.flexibleRendered + probe.flexibleFitted;

const isOverflowing = (probe: OverflowProbe): boolean =>
  naturalWidth(probe) > probe.clientWidth + OVERFLOW_TOLERANCE;

/**
 * The widths a grow column renders at while there is no slack — keyed by path,
 * or null when every grow column can genuinely fill. Null rather than an empty
 * map on purpose: "nothing is falling back" and "these columns fall back to
 * nothing" are not the same thing.
 */
type GrowFallback = ReadonlyMap<string, number> | null;

/** Two fallbacks that would render identically, so a re-measure can keep the old one. */
const sameFallback = (left: GrowFallback, right: GrowFallback): boolean => {
  if (left === null || right === null) return left === right;
  if (left.size !== right.size) return false;
  return [...left].every(([path, width]) => right.get(path) === width);
};

export { OVERFLOW_TOLERANCE, isOverflowing, naturalWidth, sameFallback };
export type { GrowFallback, OverflowProbe };
