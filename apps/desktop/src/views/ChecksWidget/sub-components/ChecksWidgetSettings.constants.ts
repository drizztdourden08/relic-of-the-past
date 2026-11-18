/* @layer renderer-widgets @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { Hint } from '@drizztdourden08/tessera/primitives';

const pinHeaderHint = (t: I18n['t']): Hint => ({ label: t('views-checks:pin.label'), description: t('views-checks:pin.description') });

const notifyHint = (t: I18n['t']): Hint => ({ label: t('views-checks:notify.label'), description: t('views-checks:notify.description') });

const notifyWhenClosedHint = (t: I18n['t']): Hint => ({ label: t('views-checks:closed.label'), description: t('views-checks:closed.description') });

export { notifyHint, notifyWhenClosedHint, pinHeaderHint };
