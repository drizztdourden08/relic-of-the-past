/* @layer renderer-components @kind logic */
/**
 * The geometry of a strip that scrolls sideways: how far it can still travel in
 * each direction, and how far one press of a paging control should take it.
 *
 * Kept apart from the DOM so the arithmetic can be read (and checked) on its
 * own — the hook beside it only supplies the three measurements.
 */

/** Sub-pixel layout widths otherwise leave a control flickering at rest. */
const EDGE_EPSILON = 1;

/**
 * One press moves nearly a full strip-width, leaving a slice of what was on
 * screen behind so the eye can follow — a per-tab nudge would take eleven
 * presses to cross a strip that wide.
 */
const PAGE_FRACTION = 0.8;

interface StripMetrics {
  scrollLeft: number;
  scrollWidth: number;
  clientWidth: number;
}

interface StripEdges {
  canScrollBack: boolean;
  canScrollForward: boolean;
}

const NO_OVERFLOW: StripEdges = { canScrollBack: false, canScrollForward: false };

const maxScrollOf = (metrics: StripMetrics): number =>
  Math.max(metrics.scrollWidth - metrics.clientWidth, 0);

const isOverflowing = (metrics: StripMetrics): boolean => maxScrollOf(metrics) > EDGE_EPSILON;

const edgesForMetrics = (metrics: StripMetrics): StripEdges => {
  if (!isOverflowing(metrics)) return NO_OVERFLOW;
  return {
    canScrollBack: metrics.scrollLeft > EDGE_EPSILON,
    canScrollForward: metrics.scrollLeft < maxScrollOf(metrics) - EDGE_EPSILON,
  };
};

const sameEdges = (a: StripEdges, b: StripEdges): boolean =>
  a.canScrollBack === b.canScrollBack && a.canScrollForward === b.canScrollForward;

const pageDeltaFor = (clientWidth: number, direction: -1 | 1): number =>
  direction * clientWidth * PAGE_FRACTION;

export {
  EDGE_EPSILON,
  NO_OVERFLOW,
  edgesForMetrics,
  isOverflowing,
  maxScrollOf,
  pageDeltaFor,
  sameEdges,
};
export type {
  StripEdges,
  StripMetrics,
};
