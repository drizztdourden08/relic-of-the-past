/* @layer renderer-components @kind logic */
/**
 * Assembles the home hero's fact rows: the profile row (ROM, dates, window)
 * and, for a randomized profile only, the run row (seed, connection, session
 * status; the per-save-file strips render beside it). The mode is the hero's
 * title, so it is not a fact.
 */
import { formatRelativeTime } from './home-tab-helpers';
import type { ProfileRandomizerConfig } from '@shared/types/profile';
import type { SummaryFact } from './home-tab.type';
import type { HomeRandomizerStatus } from './useHomeRandomizerStatus';

interface ProfileFactsInput {
  romFile: string;
  lastPlayed?: number;
  created?: number;
}

const buildProfileFacts = (input: ProfileFactsInput): SummaryFact[] => {
  const { romFile, lastPlayed, created } = input;
  const romName = romFile.replace(/\.(sfc|smc)$/i, '');
  return [
    { label: 'ROM', value: romName, title: romFile },
    { label: 'Last played', value: formatRelativeTime(lastPlayed) },
    { label: 'Created', value: formatRelativeTime(created) },
  ];
};

const buildRandomizerFacts = (
  randomizer: ProfileRandomizerConfig | undefined,
  status: HomeRandomizerStatus,
): SummaryFact[] | null => {
  if (!randomizer) return null;
  const { sessionStatusLabel } = status;
  // Checks progress is NOT a fact here: the live subscription is empty with no
  // game running, so the per-save-file strips carry it instead (offline read).
  return [
    { label: 'Seed', value: randomizer.seed, title: randomizer.seed, mono: true },
    { label: 'Connection', value: randomizer.mode === 'online' ? 'Online' : 'Local' },
    { label: 'Session', value: sessionStatusLabel },
  ];
};

export { buildProfileFacts, buildRandomizerFacts };
