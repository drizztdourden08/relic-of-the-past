/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { ProfileRandomizerConfig } from '@app/profiles/types';
import type { HomeRandomizerStatus, SummaryFact } from './home-tab.type';

const buildRandomizerFacts = (
  t: I18n['t'],
  randomizer: ProfileRandomizerConfig | undefined,
  status: HomeRandomizerStatus,
): SummaryFact[] | null => {
  if (!randomizer) return null;
  const { sessionStatusLabel } = status;
  return [
    { label: t('profiles:home.facts.seed'), value: randomizer.seed, title: randomizer.seed, mono: true },
    { label: t('profiles:home.facts.connection'), value: randomizer.mode === 'online' ? t('profiles:home.facts.archipelago') : t('profiles:home.facts.local') },
    { label: t('profiles:home.facts.session'), value: sessionStatusLabel },
  ];
};

export { buildRandomizerFacts };
