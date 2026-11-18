/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';

const singleDiscardMessage = (t: I18n['t'], files: string[]): string =>
  t('msu-studio:layers.single.discard-message', { kept: files[0], count: files.length - 1 });

export { singleDiscardMessage };
