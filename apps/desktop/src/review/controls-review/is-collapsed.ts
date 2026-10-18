/* @layer renderer-app @kind logic */
import type { AppReviewTour } from '@drizztdourden08/brock-react';
import type { SidePanelSide } from '@drizztdourden08/tessera/composites';
import { CONTROLS_SELECTORS } from './controls-review.constants';

const isCollapsed = (tour: AppReviewTour, side: SidePanelSide): boolean =>
  !(tour.find(CONTROLS_SELECTORS.panel(side))?.classList.contains('controls-settings__side--open') ?? true);

export { isCollapsed };
