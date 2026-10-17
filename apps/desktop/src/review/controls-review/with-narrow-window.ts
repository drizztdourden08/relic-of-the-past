/* @layer renderer-app @kind logic */
import type { AppReviewTour } from '@drizztdourden08/brock-react';
import { NARROW_BOUNDS } from './controls-review.constants';

const withNarrowWindow = async (tour: AppReviewTour, run: () => Promise<void>): Promise<void> => {
  const start = (await tour.api.reviewWidgetProbe({ kind: 'main' })).bounds;
  if (!start) {
    tour.check('narrow-window', false, '', 'the main window reported no bounds, so the narrow pass was skipped');
    return;
  }
  await tour.api.reviewWidgetProbe({ kind: 'main', bounds: { ...start, ...NARROW_BOUNDS } });
  await tour.settle();
  await run();
  await tour.api.reviewWidgetProbe({ kind: 'main', bounds: start });
  await tour.settle();
};

export { withNarrowWindow };
