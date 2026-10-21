/* @layer renderer-app @kind logic */
import type { AppReviewTour } from '@drizztdourden08/brock-react';
import { NARROW_BOUNDS } from './controls-review.constants';
import { controlsReviewDiagnostic } from './diagnostic-snapshot';

const withNarrowWindow = async (tour: AppReviewTour, run: () => Promise<void>): Promise<void> => {
  controlsReviewDiagnostic(tour, 'narrow.before-probe');
  const start = (await tour.api.reviewWidgetProbe({ kind: 'main' })).bounds;
  if (!start) {
    tour.check('narrow-window', false, '', 'the main window reported no bounds, so the narrow pass was skipped');
    return;
  }
  controlsReviewDiagnostic(tour, 'narrow.before-set-bounds', { currentBounds: start, requestedBounds: NARROW_BOUNDS });
  const narrow = await tour.api.reviewWidgetProbe({ kind: 'main', bounds: { ...start, ...NARROW_BOUNDS } });
  controlsReviewDiagnostic(tour, 'narrow.after-set-bounds', { requestedBounds: NARROW_BOUNDS, actualBounds: narrow.bounds });
  await tour.settle();
  controlsReviewDiagnostic(tour, 'narrow.after-settle');
  await run();
  controlsReviewDiagnostic(tour, 'narrow.after-captures');
  const restored = await tour.api.reviewWidgetProbe({ kind: 'main', bounds: start });
  controlsReviewDiagnostic(tour, 'narrow.after-restore', { requestedBounds: start, actualBounds: restored.bounds });
  await tour.settle();
  controlsReviewDiagnostic(tour, 'narrow.after-restore-settle');
};

export { withNarrowWindow };
