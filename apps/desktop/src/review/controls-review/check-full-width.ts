/* @layer renderer-app @kind logic */
import type { AppReviewTour } from '@drizztdourden08/brock-react';
import { CONTROLS_SELECTORS, RECT_SLACK } from './controls-review.constants';
import { rectOf } from './rect-of';

const checkFullWidth = (tour: AppReviewTour, name: string): void => {
  const page = rectOf(tour, CONTROLS_SELECTORS.page);
  const end = rectOf(tour, CONTROLS_SELECTORS.panel('end'));
  const reaches = page !== null && end !== null && Math.abs(page.right - end.right) <= RECT_SLACK;
  tour.check(`${name}-full-width`, reaches, `${name}: the Devices panel ends at the right edge of the page`, `${name}: the page leaves room after the Devices panel`);
};

export { checkFullWidth };
