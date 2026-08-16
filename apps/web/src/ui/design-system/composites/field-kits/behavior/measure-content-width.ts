/* @layer renderer-components @kind logic */
/**
 * How much room the thing inside a control actually takes.
 *
 * Two readings that look like they would answer this do not. The control's own
 * box is a flex item told to fill the row, so it measures the row rather than
 * itself — asked while the row is wide it claims to want the whole width, and
 * the answer would shrink and grow with the window instead of staying a
 * property of the content. And `scrollWidth` is entitled to hand back the box
 * for a control whose overflow is visible, which is exactly the case here: a
 * segmented track refuses to shrink and simply spills past its parent instead
 * of being clipped by it.
 *
 * What does answer it is where the descendants lie. Nothing in this row is
 * clipped, so the piece that refuses to shrink can be read where it sits — left
 * edge of the leftmost to right edge of the rightmost — with no clone, no host
 * element and nothing written to the DOM to read it back.
 */

/** Text with no element around it — the box is all there is to go on. */
const ownWidth = (element: Element): number =>
  Math.ceil(element.getBoundingClientRect().width);

const measureContentWidth = (element: Element): number => {
  const boxes = [...element.querySelectorAll('*')].map((node) => node.getBoundingClientRect());
  if (boxes.length === 0) return ownWidth(element);
  const left = Math.min(...boxes.map((box) => box.left));
  const right = Math.max(...boxes.map((box) => box.right));
  return Math.ceil(right - left);
};

export { measureContentWidth };
