/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { formatDate } from '@drizztdourden08/tessera/primitives';
import type { ProfileFactsInput, SummaryFact } from './home-tab.type';

const agoOf = (ts: number | undefined, t: I18n['t']): string => (ts ? formatDate(ts, 'relative') : t('profiles:home.facts.never'));

const buildProfileFacts = (input: ProfileFactsInput, t: I18n['t']): SummaryFact[] => {
  const { romFile, lastPlayed, created } = input;
  const romName = (romFile ?? t('profiles:home.facts.no-rom')).replace(/\.(sfc|smc)$/i, '');
  return [
    { label: t('profiles:home.facts.rom'), value: romName, title: romFile },
    { label: t('profiles:home.facts.last-played'), value: agoOf(lastPlayed, t) },
    { label: t('profiles:home.facts.created'), value: agoOf(created, t) },
  ];
};

export { buildProfileFacts };
