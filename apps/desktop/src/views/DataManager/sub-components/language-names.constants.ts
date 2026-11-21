/* @layer renderer-components @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';

const languageNames = (t: I18n['t']): Record<string, string> => ({
  us: t('data-manager:language.us'),
  en: t('data-manager:language.en'),
  de: t('data-manager:language.de'),
  fr: t('data-manager:language.fr'),
  'fr-c': t('data-manager:language.fr-c'),
  es: t('data-manager:language.es'),
  pl: t('data-manager:language.pl'),
  pt: t('data-manager:language.pt'),
  nl: t('data-manager:language.nl'),
  sv: t('data-manager:language.sv'),
  ja: t('data-manager:language.ja'),
});

export { languageNames };
