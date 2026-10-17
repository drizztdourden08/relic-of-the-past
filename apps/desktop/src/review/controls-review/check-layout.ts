/* @layer renderer-app @kind logic */
import type { AppReviewTour } from '@drizztdourden08/brock-react';
import { CONTROLS_SELECTORS, RECT_SLACK } from './controls-review.constants';
import { rectOf } from './rect-of';

const overlaps = (a: DOMRect, b: DOMRect): boolean =>
  a.left < b.right - RECT_SLACK && b.left < a.right - RECT_SLACK && a.top < b.bottom - RECT_SLACK && b.top < a.bottom - RECT_SLACK;

const checkLayout = (tour: AppReviewTour, name: string): void => {
  const tabs = rectOf(tour, CONTROLS_SELECTORS.tabs);
  const main = rectOf(tour, CONTROLS_SELECTORS.main);
  const panels = (['start', 'end'] as const).map((side) => rectOf(tour, CONTROLS_SELECTORS.panel(side)));
  const clear = tabs !== null && main !== null && panels.every((panel) => panel !== null && !overlaps(panel, main) && !overlaps(panel, tabs));
  tour.check(`${name}-no-overlap`, clear, `${name}: the tab row and the bindings clear both side panels`, `${name}: the middle overlaps a side panel`);

  const body = tour.find(CONTROLS_SELECTORS.body);
  const scrolls = body !== null && getComputedStyle(body).overflowY === 'auto';
  tour.check(`${name}-scrolls`, scrolls, `${name}: the tab content scrolls in its own area`, `${name}: the tab content has no scroll area`);
};

export { checkLayout };
