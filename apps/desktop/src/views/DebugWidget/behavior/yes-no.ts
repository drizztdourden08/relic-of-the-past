/* @layer renderer-widgets @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
const yn = (t: I18n['t'], v: boolean | number): string => (v ? t('views-debug:value.yes') : '-');

export { yn };
