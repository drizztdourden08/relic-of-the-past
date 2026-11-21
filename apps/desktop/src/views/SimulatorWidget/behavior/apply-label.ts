/* @layer renderer-widgets @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { ApplyState } from '../SimulatorWidget.type';

const applyLabel = (t: I18n['t'], state: ApplyState): string => {
  if (state === 'applied') return t('views-simulator:apply.applied');
  if (state === 'applying') return t('views-simulator:apply.applying');
  return t('views-simulator:apply.idle');
};

export { applyLabel };
