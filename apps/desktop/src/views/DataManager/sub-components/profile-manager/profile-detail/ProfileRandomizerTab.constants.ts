/* @layer renderer-components @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';

const scopeOptions = (t: I18n['t']) => [
  { value: 'changed', label: t('data-manager:profile-detail.randomizer.scope-changed') },
  { value: 'all', label: t('data-manager:profile-detail.randomizer.scope-all') },
];

const scopeTitles = (t: I18n['t']) => ({
  changed: t('data-manager:profile-detail.randomizer.title-changed'),
  all: t('data-manager:profile-detail.randomizer.title-all'),
}) as const;

export { scopeOptions, scopeTitles };
