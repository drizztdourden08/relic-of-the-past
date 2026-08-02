/* @layer renderer-components @kind logic */
/**
 * How wide an element's content WANTS to be, told apart from how wide its box
 * happens to be right now.
 *
 * A clipped element cannot answer that about itself. `scrollWidth` only rises
 * above the box once the content is genuinely spilling out of it; while the
 * content fits, it hands the box straight back. So asking a comfortably sized
 * cell how much room it needs returns the room it already has, and a fit built
 * on that can hold a column where it is or push it wider, but never bring it in.
 *
 * The way out is to measure the element somewhere nothing is holding it: a copy
 * of it, sized to `max-content`, inside a hidden host parked off the top of the
 * viewport. A COPY rather than the element itself because the real one is a grid
 * item — letting go of it would resize the tracks around it. The real node
 * cloned rather than its text run through a canvas because a cell is not always
 * text: a badge, a linked id in a mono face and a muted placeholder each render
 * as something with a size of its own, and only the browser laying the actual
 * thing out gets all of them right.
 *
 * Everything asked for in one call is measured in one pass — the clones go up
 * together, the widths come back together, the host comes down — so a column is
 * one layout rather than one per row.
 */

/**
 * Parked out of sight the same way the drag ghost is: it has to be laid out for
 * anything to be read off it, so it can be moved away but not hidden. `fixed`
 * keeps it out of the table scroller's overflow, and the host sits on the
 * document body so no ancestor transform can become its containing block and
 * cap what `max-content` is allowed to reach.
 */
const HOST_STYLE = [
  'position: fixed',
  'top: -100vh',
  'left: 0',
  'visibility: hidden',
  'pointer-events: none',
].join('; ');

/**
 * The copy, let go of: no track to fill, no box to fit inside, and sized to
 * exactly what it holds. Replacing the style attribute outright rather than
 * adding to it also drops any transform the original was carrying, which would
 * otherwise land in the measurement. `display: block` because the original may
 * be an inline label, and width means nothing on an inline box.
 */
const CLONE_STYLE = [
  'position: static',
  'display: block',
  'width: max-content',
  'min-width: 0',
  'max-width: none',
  'flex: none',
  'transform: none',
].join('; ');

/**
 * The natural width of every element handed in, in the order they were handed
 * in. Nothing to measure touches no DOM at all.
 */
const naturalContentWidths = (elements: readonly HTMLElement[]): number[] => {
  const [first] = elements;
  if (!first) return [];

  const doc = first.ownerDocument;
  const host = doc.createElement('div');
  host.setAttribute('style', HOST_STYLE);

  const clones = elements.map((element) => {
    /* cloneNode is typed as returning a Node; a clone of an element is one. */
    const clone = element.cloneNode(true) as HTMLElement;
    clone.setAttribute('style', CLONE_STYLE);
    host.appendChild(clone);
    return clone;
  });

  doc.body.appendChild(host);
  /* Read only once everything is up: one layout for the batch, not one each. */
  const widths = clones.map((clone) => Math.ceil(clone.getBoundingClientRect().width));
  host.remove();

  return widths;
};

/** The same question about a single element. */
const naturalContentWidth = (element: HTMLElement): number =>
  naturalContentWidths([element])[0] ?? 0;

export { CLONE_STYLE, HOST_STYLE, naturalContentWidth, naturalContentWidths };
