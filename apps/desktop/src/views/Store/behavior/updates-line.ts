/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';

const updatesLine = (t: I18n['t'], count: number): string => t('views-store:home.updates', { count });

export { updatesLine };
