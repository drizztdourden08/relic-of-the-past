/* @layer renderer-app @kind logic */
import { nav } from '@drizztdourden08/brock-react';
import type { AppReviewTour } from '@drizztdourden08/brock-react';
import { CONTROLS_HUB, CONTROLS_SECTION, CONTROLS_SELECTORS } from './controls-review.constants';

const openControls = async (tour: AppReviewTour): Promise<boolean> => {
  nav.open(CONTROLS_HUB, { section: CONTROLS_SECTION });
  const page = await tour.waitFor(() => tour.find(CONTROLS_SELECTORS.page));
  await tour.settle();
  return page !== null;
};

export { openControls };
