/* @layer renderer-app @kind logic */
import type { AppReviewTour } from '@drizztdourden08/brock-react';
import type { SidePanelSide } from '@drizztdourden08/tessera/composites';
import { CONTROLS_SELECTORS } from './controls-review.constants';

const isCollapsed = (tour: AppReviewTour, side: SidePanelSide): boolean => {
  const panel = tour.find(CONTROLS_SELECTORS.panel(side));
  return panel !== null && tour.find(CONTROLS_SELECTORS.toggle, panel)?.getAttribute('aria-expanded') === 'false';
};

export { isCollapsed };
