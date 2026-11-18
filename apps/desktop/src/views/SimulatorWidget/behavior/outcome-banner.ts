/* @layer renderer-widgets @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { SimOutcome } from '@rotp/navigation';
import { getCheck } from '@rotp/game-data';
import type { CheckId } from '@rotp/game-data';
import type { OutcomeBanner } from '../SimulatorWidget.type';

const resolveStopName = (t: I18n['t'], stopAtCheckId: CheckId | ''): string =>
  stopAtCheckId ? getCheck(stopAtCheckId).name : t('views-simulator:outcome.stop.fallback');

const outcomeBanner = (t: I18n['t'], outcome: SimOutcome, stopAtCheckId: CheckId | ''): OutcomeBanner => {
  switch (outcome) {
    case 'stopped-at-check':
      return { tone: 'success', icon: 'check', title: t('views-simulator:outcome.success'), detail: t('views-simulator:outcome.reached', { name: resolveStopName(t, stopAtCheckId) }) };
    case 'completed':
      return { tone: 'success', icon: 'check', title: t('views-simulator:outcome.success'), detail: t('views-simulator:outcome.completed') };
    case 'not-completable':
      return { tone: 'danger', icon: 'x', title: t('views-simulator:outcome.blocked.title'), detail: t('views-simulator:outcome.blocked.detail') };
  }
};

export { outcomeBanner };
