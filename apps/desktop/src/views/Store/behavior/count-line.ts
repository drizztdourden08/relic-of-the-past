/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';

const countLine = (t: I18n['t'], shown: number): string => t('views-store:browse.count', { count: shown });

export { countLine };
