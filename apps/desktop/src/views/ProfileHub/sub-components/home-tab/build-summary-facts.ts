/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { formatDate } from '@drizztdourden08/tessera/primitives';
import type { DateFormatOptions } from '@drizztdourden08/tessera/primitives';
import type { ProfileFactsInput, SummaryFact } from './home-tab.type';

const agoOf = (ts: number | undefined, t: I18n['t'], dates: DateFormatOptions): string => (ts ? formatDate(ts, 'relative', dates) : t('profiles:home.facts.never'));

const buildProfileFacts = (input: ProfileFactsInput, t: I18n['t'], dates: DateFormatOptions): SummaryFact[] => {
  const { romFile, lastPlayed, created } = input;
  const romName = (romFile ?? t('profiles:home.facts.no-rom')).replace(/\.(sfc|smc)$/i, '');
  return [
    { label: t('profiles:home.facts.rom'), value: romName, title: romFile },
    { label: t('profiles:home.facts.last-played'), value: agoOf(lastPlayed, t, dates) },
    { label: t('profiles:home.facts.created'), value: agoOf(created, t, dates) },
  ];
};

export { buildProfileFacts };
