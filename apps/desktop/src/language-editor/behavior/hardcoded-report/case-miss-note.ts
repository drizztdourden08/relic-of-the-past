/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';

const caseMissNote = (t: I18n['t'], misses: number): string => (
  misses === 0 ? '' : t('language-editor:hardcoded.case-misses', { count: misses })
);

export { caseMissNote };
