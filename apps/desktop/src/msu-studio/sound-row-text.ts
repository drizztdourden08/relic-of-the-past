/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { triggerSummary } from './sound-labels';
import type { SoundRowData } from './msu.type';

const soundRowText = (t: I18n['t'], row: SoundRowData): { name: string; under: string } => {
  const { label, triggers, sites } = row;
  const summary = triggerSummary(t, triggers);
  return {
    name: label ?? (summary.length > 0 ? summary : t('msu-studio:sound.row.unnamed')),
    under: label !== null ? summary : t('msu-studio:sound.row.call-sites', { count: sites }),
  };
};

export { soundRowText };
