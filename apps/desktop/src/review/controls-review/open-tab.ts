/* @layer renderer-app @kind logic */
import type { AppReviewTour } from '@drizztdourden08/brock-react';
import { CONTROLS_SELECTORS } from './controls-review.constants';

const openTab = async (tour: AppReviewTour, label: string): Promise<void> => {
  const tab = tour.findAll(CONTROLS_SELECTORS.tab).find((node) => node.textContent.trim() === label);
  if (tab) tour.click(tab);
  await tour.settle();
};

export { openTab };
