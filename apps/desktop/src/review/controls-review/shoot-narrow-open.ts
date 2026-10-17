/* @layer renderer-app @kind logic */
import type { AppReviewTour } from '@drizztdourden08/brock-react';
import type { ListPanelSide } from '@app/compounds/ListPanel';
import { CONTROLS_SELECTORS } from './controls-review.constants';
import { setFold } from './set-fold';

const shootNarrowOpen = async (tour: AppReviewTour, side: ListPanelSide): Promise<void> => {
  const other: ListPanelSide = side === 'start' ? 'end' : 'start';
  await setFold(tour, other, true);
  await setFold(tour, side, false);
  const panel = tour.find(CONTROLS_SELECTORS.panel(side));
  const overlays = panel !== null && getComputedStyle(panel).position === 'absolute';
  const name = `narrow-open-${side}`;
  tour.check(name, overlays, `${name}: in a narrow window the open panel lies over the bindings`, `${name}: in a narrow window the open panel squeezes the bindings`);
  await tour.capture(name);
  await setFold(tour, side, true);
};

export { shootNarrowOpen };
