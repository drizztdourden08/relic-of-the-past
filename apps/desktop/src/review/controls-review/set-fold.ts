/* @layer renderer-app @kind logic */
import type { AppReviewTour } from '@drizztdourden08/brock-react';
import type { SidePanelSide } from '@drizztdourden08/tessera/composites';
import { CONTROLS_SELECTORS } from './controls-review.constants';
import { isCollapsed } from './is-collapsed';

const setFold = async (tour: AppReviewTour, side: SidePanelSide, collapsed: boolean): Promise<void> => {
  if (isCollapsed(tour, side) === collapsed) return;
  const panel = tour.find(CONTROLS_SELECTORS.panel(side));
  const toggle = panel && tour.find(CONTROLS_SELECTORS.toggle, panel);
  if (toggle) tour.click(toggle);
  await tour.waitFor(() => isCollapsed(tour, side) === collapsed);
  await tour.settle();
};

export { setFold };
