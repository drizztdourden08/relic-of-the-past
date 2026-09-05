/* @layer renderer-components @kind logic */
/**
 * How wide an element's content wants to be. `scrollWidth` only exceeds the box
 * once content spills, so a clipped cell cannot be asked directly. Instead a
 * clone sized to `max-content` is measured in a hidden host off the viewport: a
 * clone because the real node is a grid item, a clone (not canvas text) because
 * a cell may be a badge or a mono id. One pass per call, so a column is one layout.
 */

/**
 * The host must be laid out to be read, so it is moved away, not hidden. `fixed`
 * keeps it out of the scroller's overflow; on the body, no ancestor transform
 * can cap `max-content`.
 */
const HOST_STYLE = [
  'position: fixed',
  'top: -100vh',
  'left: 0',
  'visibility: hidden',
  'pointer-events: none',
].join('; ');

/**
 * The copy, sized to what it holds. Replacing the style attribute outright also
 * drops any transform the original carried. `display: block` because width means
 * nothing on an inline box.
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

/** Natural width of every element, in order. An empty list touches no DOM. */
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
