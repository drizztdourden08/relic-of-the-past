/* @layer renderer-app @kind logic */
import { createI18n } from '@drizztdourden08/brock-core/i18n';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { appLocales } from '../../../.brock/locales';

const gameI18n: I18n = createI18n({
  base: appLocales.base,
  layers: appLocales.layers,
  load: appLocales.load,
  dev: import.meta.env.DEV,
});

export { gameI18n };
