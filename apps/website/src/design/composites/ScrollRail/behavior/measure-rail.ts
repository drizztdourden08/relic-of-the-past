/* @layer website-site @kind logic */
import { EMPTY_GEOMETRY } from '../ScrollRail.constants';
import type { RailGeometry, ScrollRailMark } from '../ScrollRail.type';

const pageTop = (element: Element): number => element.getBoundingClientRect().top + window.scrollY;

const measureRail = (marks: readonly ScrollRailMark[], rangeId: string): RailGeometry => {
  const range = document.getElementById(rangeId);
  if (!range) return EMPTY_GEOMETRY;
  const top = pageTop(range);
  const span = Math.max(range.getBoundingClientRect().height, 1);
  const fractions = marks.map((mark) => {
    const anchor = document.getElementById(mark.id);
    return anchor ? Math.min(Math.max((pageTop(anchor) - top) / span, 0), 1) : 0;
  });
  return { top, span, fractions };
};

export { measureRail };
