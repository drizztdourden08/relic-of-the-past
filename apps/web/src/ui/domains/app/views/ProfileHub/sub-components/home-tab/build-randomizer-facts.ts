/* @layer renderer-components @kind logic */
import type { ProfileRandomizerConfig } from '@shared/types/profile';
import type { HomeRandomizerStatus, SummaryFact } from './home-tab.type';

const buildRandomizerFacts = (
  randomizer: ProfileRandomizerConfig | undefined,
  status: HomeRandomizerStatus,
): SummaryFact[] | null => {
  if (!randomizer) return null;
  const { sessionStatusLabel } = status;
  return [
    { label: 'Seed', value: randomizer.seed, title: randomizer.seed, mono: true },
    { label: 'Connection', value: randomizer.mode === 'online' ? 'Archipelago' : 'Local' },
    { label: 'Session', value: sessionStatusLabel },
  ];
};

export { buildRandomizerFacts };
