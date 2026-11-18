/* @layer renderer-widgets @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { CheckGrantPlan } from '@app/game';

const notPlanned = (t: I18n['t']): CheckGrantPlan => ({ kind: 'blocked', reason: t('views-cheats:checks.notPlanned') });

export { notPlanned };
