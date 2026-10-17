/* @layer renderer-app @kind logic */
import { defineReviewStep } from '@drizztdourden08/brock-react';
import type { AppReviewTour } from '@drizztdourden08/brock-react';
import { checkAddFromRail } from './controls-review/add-from-rail';
import { checkFullWidth } from './controls-review/check-full-width';
import { checkLayout } from './controls-review/check-layout';
import { ALL_TAB_IDS, CONTROLS_TABS } from './controls-review/controls-review.constants';
import { isCollapsed } from './controls-review/is-collapsed';
import { openControls } from './controls-review/open-controls';
import { openTab } from './controls-review/open-tab';
import { setBothFolds } from './controls-review/set-both-folds';
import { setFold } from './controls-review/set-fold';
import { shootNarrowOpen } from './controls-review/shoot-narrow-open';
import { withNarrowWindow } from './controls-review/with-narrow-window';

const shootTabs = async (tour: AppReviewTour, prefix: string, ids: readonly string[]): Promise<void> => {
  for (const tab of CONTROLS_TABS.filter(({ id }) => ids.includes(id))) {
    await openTab(tour, tab.label);
    const name = `${prefix}-${tab.id}`;
    checkLayout(tour, name);
    await tour.capture(name);
  }
};

const run = async (tour: AppReviewTour): Promise<void> => {
  const opened = await openControls(tour);
  tour.check('controls-opens', opened, 'Game > Controls opens', 'Game > Controls did not open');
  if (!opened) return;
  const folds = { start: isCollapsed(tour, 'start'), end: isCollapsed(tour, 'end') };

  await setBothFolds(tour, false);
  await shootTabs(tour, 'open', ALL_TAB_IDS);
  checkFullWidth(tour, 'open');

  await setBothFolds(tour, true);
  await shootTabs(tour, 'folded', ['vanilla', 'options']);
  checkFullWidth(tour, 'folded');

  await checkAddFromRail(tour);

  await withNarrowWindow(tour, async () => {
    await setBothFolds(tour, true);
    await shootTabs(tour, 'narrow-folded', ['vanilla', 'options']);
    await openTab(tour, CONTROLS_TABS[0].label);
    await shootNarrowOpen(tour, 'start');
    await shootNarrowOpen(tour, 'end');
  });

  await openTab(tour, CONTROLS_TABS[0].label);
  await setFold(tour, 'start', folds.start);
  await setFold(tour, 'end', folds.end);
};

export default defineReviewStep({ run });
