/* @layer renderer-components @kind util */
/**
 * Rectangle maths for a panel that floats beside the element which opened it.
 *
 * A portalled panel is placed in viewport coordinates, which makes it blind to
 * the scrolling of whatever container its anchor lives in: the anchor slides
 * away and the panel stays behind. These helpers answer the two questions that
 * fixes — where the anchor is now, and whether it can still be seen at all —
 * as plain geometry, with no React and no state, so they can be reasoned about
 * and tested on their own.
 */

/** A viewport-space rectangle. `DOMRect` satisfies this shape as-is. */
interface Bounds {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Overflow values that clip a descendant rather than letting it spill out. */
const CLIPPING_OVERFLOW = /^(auto|scroll|overlay|hidden|clip)$/;

const viewportBounds = (): Bounds => ({
  top: 0,
  right: window.innerWidth,
  bottom: window.innerHeight,
  left: 0,
});

const intersect = (a: Bounds, b: Bounds): Bounds => ({
  top: Math.max(a.top, b.top),
  right: Math.min(a.right, b.right),
  bottom: Math.min(a.bottom, b.bottom),
  left: Math.max(a.left, b.left),
});

/** True while any part of `rect` still falls inside `bounds`. */
const overlaps = (rect: Bounds, bounds: Bounds): boolean =>
  rect.bottom > bounds.top
  && rect.top < bounds.bottom
  && rect.right > bounds.left
  && rect.left < bounds.right;

const clipsOverflow = (el: Element): boolean => {
  const style = getComputedStyle(el);
  return CLIPPING_OVERFLOW.test(style.overflowY) || CLIPPING_OVERFLOW.test(style.overflowX);
};

/**
 * The ancestors that can hide the anchor by scrolling it past their own edge.
 * Resolved once when a panel opens, because `getComputedStyle` is far too
 * expensive to repeat on every scroll tick while re-reading a rect is cheap.
 */
const clippingAncestorsOf = (el: Element): Element[] => {
  const chain: Element[] = [];
  for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
    if (clipsOverflow(node)) chain.push(node);
  }
  return chain;
};

/** The region the anchor is actually visible through — every clip, plus the viewport. */
const visibleBoundsOf = (ancestors: readonly Element[]): Bounds =>
  ancestors.reduce<Bounds>((acc, el) => intersect(acc, el.getBoundingClientRect()), viewportBounds());

export { clippingAncestorsOf, intersect, overlaps, viewportBounds, visibleBoundsOf };
export type { Bounds };
