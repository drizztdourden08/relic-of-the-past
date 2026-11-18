/* @layer renderer-widgets @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { Hint } from '@drizztdourden08/tessera/primitives';

const modeHint = (t: I18n['t']): Hint => ({ label: t('views-navigation:settings.mode.label'), description: t('views-navigation:settings.mode.description') });

export { modeHint };
