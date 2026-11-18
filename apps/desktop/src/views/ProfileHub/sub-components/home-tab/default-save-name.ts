/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { formatDate } from '@drizztdourden08/tessera/primitives';

const defaultSaveName = (t: I18n['t']): string => t('profiles:home.default-save-name', { date: formatDate(Date.now(), 'datetime') });

export { defaultSaveName };
