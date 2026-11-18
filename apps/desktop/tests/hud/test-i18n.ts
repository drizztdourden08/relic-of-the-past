/* @layer tests @kind helper */
import { createI18n } from '@drizztdourden08/brock-core/i18n';
import { appLocales } from '../../.brock/locales';

const i18n = createI18n({ base: appLocales.base, layers: appLocales.layers });

export { i18n };
