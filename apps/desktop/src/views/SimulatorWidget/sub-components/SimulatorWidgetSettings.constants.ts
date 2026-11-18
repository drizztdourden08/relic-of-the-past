/* @layer renderer-widgets @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { Hint } from '@drizztdourden08/tessera/primitives';

const screenLimitHint = (t: I18n['t']): Hint => ({ label: t('views-simulator:settings.screen.limit.label'), description: t('views-simulator:settings.screen.limit.description') });

export { screenLimitHint };
