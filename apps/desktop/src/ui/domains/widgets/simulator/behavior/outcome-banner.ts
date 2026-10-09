/* @layer renderer-widgets @kind logic */
import type { SimOutcome } from '@shared/game/simulation';
import { getCheck } from '@rotp/game-data';
import type { CheckId } from '@rotp/game-data';
import type { OutcomeBanner } from '../SimulatorWidget.type';

const resolveStopName = (stopAtCheckId: CheckId | ''): string =>
  stopAtCheckId ? getCheck(stopAtCheckId).name : 'stop check';

const outcomeBanner = (outcome: SimOutcome, stopAtCheckId: CheckId | ''): OutcomeBanner => {
  switch (outcome) {
    case 'stopped-at-check':
      return { tone: 'success', icon: '✓', title: 'Success', detail: `Reached ${resolveStopName(stopAtCheckId)}` };
    case 'completed':
      return { tone: 'success', icon: '✓', title: 'Success', detail: 'All checks complete and the goal reached' };
    case 'not-completable':
      return { tone: 'danger', icon: '✕', title: 'Not completable', detail: 'The frontier exhausted with checks still blocked' };
  }
};

export { outcomeBanner };
