/* @layer renderer-app @kind logic */
import type { AppReviewTour } from '@drizztdourden08/brock-react';
import type { ListPanelSide } from '@app/compounds/ListPanel';
import { CONTROLS_SELECTORS } from './controls-review.constants';

const isCollapsed = (tour: AppReviewTour, side: ListPanelSide): boolean =>
  tour.find(CONTROLS_SELECTORS.panel(side))?.classList.contains('list-panel--collapsed') ?? false;

export { isCollapsed };
