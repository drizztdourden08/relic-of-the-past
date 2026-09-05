/* @layer renderer-components @kind logic */
/**
 * Finds a column's elements for "fit to content"; `measure-natural-width`
 * measures them. Only rendered rows are seen, so collapsed groups are not
 * measured. Kept apart from the arithmetic so the sizing rule is testable without a DOM.
 */
import { fitAllWidths, fitColumnWidth } from './column-width-math';
import { naturalContentWidth, naturalContentWidths } from './measure-natural-width';
import type { ColumnWidth } from './column-width-math';

/** Marks a body cell with the column it belongs to. */
const CELL_ATTR = 'data-column';

/** The header cell of that same column, measured differently (see below). */
const HEAD_ATTR = 'data-column-head';

/** The one part of a header that clips, so the one part worth re-measuring. */
const LABEL_ATTR = 'data-column-label';

/** In a header only the label is squeezed, so its width is the current chrome plus the label at full length. */
const headerContentWidth = (cell: HTMLElement): number => {
  const label = cell.querySelector(`[${LABEL_ATTR}]`);
  if (!(label instanceof HTMLElement)) return naturalContentWidth(cell);
  const chrome = cell.getBoundingClientRect().width - label.getBoundingClientRect().width;
  return chrome + naturalContentWidth(label);
};

const htmlElements = (root: ParentNode, selector: string): HTMLElement[] =>
  [...root.querySelectorAll(selector)].filter((node): node is HTMLElement => node instanceof HTMLElement);

/** Every width the column is currently showing, header included. */
const columnContentWidths = (root: ParentNode, path: string): number[] => [
  ...htmlElements(root, `[${HEAD_ATTR}="${path}"]`).map(headerContentWidth),
  ...naturalContentWidths(htmlElements(root, `[${CELL_ATTR}="${path}"]`)),
];

/** The one number "fit to content" is after. Everything that fits a column goes through here. */
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
