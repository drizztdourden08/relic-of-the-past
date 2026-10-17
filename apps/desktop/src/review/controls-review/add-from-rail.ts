/* @layer renderer-app @kind logic */
import type { AppReviewTour } from '@drizztdourden08/brock-react';
import { CONTROLS_SELECTORS } from './controls-review.constants';
import { isCollapsed } from './is-collapsed';
import { setFold } from './set-fold';

const removeNewProfile = async (tour: AppReviewTour): Promise<void> => {
  const remove = tour.find(CONTROLS_SELECTORS.deleteProfile);
  if (!remove) return;
  tour.click(remove);
  const confirm = await tour.waitFor(() => tour.findAll(CONTROLS_SELECTORS.confirmDelete).find((node) => node.textContent.trim() === 'Delete'));
  if (confirm) tour.click(confirm);
  await tour.settle();
};

const checkAddFromRail = async (tour: AppReviewTour): Promise<void> => {
  await setFold(tour, 'start', true);
  const panel = tour.find(CONTROLS_SELECTORS.panel('start'));
  const add = panel && tour.find(CONTROLS_SELECTORS.newProfile, panel);
  if (!add) {
    tour.check('add-from-rail', false, '', 'the folded Profiles rail has no New profile button');
    return;
  }
  tour.click(add);
  const field = await tour.waitFor(() => tour.find(CONTROLS_SELECTORS.renameField));
  const naming = !isCollapsed(tour, 'start') && field !== null && document.activeElement === field;
  tour.check('add-from-rail', naming, 'New profile on the folded rail opens the panel and starts naming the new profile', 'New profile on the folded rail did not open the panel on the name of the new profile');
  await tour.capture('add-from-rail');
  tour.press({ key: 'Escape' });
  await tour.settle();
  await removeNewProfile(tour);
};

export { checkAddFromRail };
