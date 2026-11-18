/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { NAMES_SHOWN } from './sound-labels.constants';

const listSummary = (t: I18n['t'], names: string[]): string => {
  const shown = names.slice(0, NAMES_SHOWN).join(' · ');
  const rest = names.length - NAMES_SHOWN;
  return rest > 0 ? t('msu-studio:usage.more', { names: shown, count: rest }) : shown;
};

export { listSummary };
