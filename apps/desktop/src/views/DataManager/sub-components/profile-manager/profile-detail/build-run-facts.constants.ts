/* @layer renderer-components @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { ProfileRandomizerConfig } from '@app/profiles/types';

const runTypeLabels = (t: I18n['t']): Readonly<Record<ProfileRandomizerConfig['mode'], string>> => ({
  local: t('data-manager:profile-detail.run.local'),
  online: t('data-manager:profile-detail.run.online'),
  archipelia: t('data-manager:profile-detail.run.archipelia'),
});

export { runTypeLabels };
