/* @layer renderer-app @kind logic */
import type { AppReviewTour } from '@drizztdourden08/brock-react';
import { setFold } from './set-fold';

const setBothFolds = async (tour: AppReviewTour, collapsed: boolean): Promise<void> => {
  await setFold(tour, 'start', collapsed);
  await setFold(tour, 'end', collapsed);
};

export { setBothFolds };
