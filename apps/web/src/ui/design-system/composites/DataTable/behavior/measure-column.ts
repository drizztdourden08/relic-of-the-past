/* @layer renderer-components @kind logic */
/**
 * "Fit to content" needs to know how wide the values in a column actually are,
 * and only the browser knows that. This is the half that finds a column's
 * elements; how wide each one's content wants to be is a question of its own,
 * answered next door — a clipped cell cannot be asked directly, because while
 * its content fits it only reports the width it already has.
 *
 * It can only see what is on screen: a collapsed group's rows and anything the
 * table has not rendered are not measured, which is the same honest limit the
 * drag ghost's sample lives with. Kept apart from the arithmetic next door so
 * the sizing rule stays testable without a DOM.
 */
import { fitAllWidths, fitColumnWidth } from './column-width-math';
import { naturalContentWidth, naturalContentWidths } from './measure-natural-width';
import type { ColumnWidth } from './column-width-math';

/** Marks a body cell with the column it belongs to. */
const CELL_ATTR = 'data-column';

/** The header cell of that same column — measured differently, see below. */
const HEAD_ATTR = 'data-column-head';

/** The one part of a header that clips, so the one part worth re-measuring. */
const LABEL_ATTR = 'data-column-label';

/**
 * A header is a flex row — the caret and the ⋯ hold their size and only the
 * label is squeezed, so the width it wants is everything else it holds, at the
 * size it is at now, plus that label at its own full length.
 */
const headerContentWidth = (cell: HTMLElement): number => {
  const label = cell.querySelector(`[${LABEL_ATTR}]`);
  if (!(label instanceof HTMLElement)) return naturalContentWidth(cell);
  const chrome = cell.getBoundingClientRect().width - label.getBoundingClientRect().width;
  return chrome + naturalContentWidth(label);
};

const htmlElements = (root: ParentNode, selector: string): HTMLElement[] =>
  [...root.querySelectorAll(selector)].filter((node): node is HTMLElement => node instanceof HTMLElement);

/** Every width the column is currently showing — its header among them. */
const columnContentWidths = (root: ParentNode, path: string): number[] => [
  ...htmlElements(root, `[${HEAD_ATTR}="${path}"]`).map(headerContentWidth),
  ...naturalContentWidths(htmlElements(root, `[${CELL_ATTR}="${path}"]`)),
];

/**
 * The one number "fit to content" is after. Everything that fits a column goes
 * through here — the ⋯ menu, the footer's fit-all, and the fallback a grow
 * column takes while the table has nothing left to give it — so no two of them
 * can drift into measuring the same column differently.
 */
const measuredFitWidth = (root: ParentNode, path: string): number =>
  fitColumnWidth(columnContentWidths(root, path));

/** The same, over a set of columns, in the order they were asked for. */
const measuredFitWidths = (root: ParentNode, paths: readonly string[]): ColumnWidth[] =>
  fitAllWidths(paths, (path) => columnContentWidths(root, path));

/** What the column is laid out at right now, which is a different question. */
const renderedHeaderWidth = (root: ParentNode, path: string): number => {
  const head = root.querySelector(`[${HEAD_ATTR}="${path}"]`);
  return head instanceof HTMLElement ? head.getBoundingClientRect().width : 0;
};

export {
  CELL_ATTR, HEAD_ATTR, LABEL_ATTR,
  columnContentWidths, measuredFitWidth, measuredFitWidths, renderedHeaderWidth,
};
