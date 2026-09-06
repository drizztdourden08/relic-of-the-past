/* @layer renderer-components @kind logic */
/**
 * Assembles the home summary panel's fact rows: the profile row (mode, ROM,
 * dates, window) and — for a randomized profile only — the run row (seed,
 * connection, session status; the per-save-file strips render beside it).
 */
import { MODE_BADGE_LABELS } from '../../../../compounds/ModeBadge';
import { formatRelativeTime } from './home-tab-helpers';
import type { ProfileModeId } from '../../../../compounds/ModeBadge';
import type { ProfileRandomizerConfig } from '@shared/types/profile';
import type { SummaryFact } from './home-tab.type';
import type { HomeRandomizerStatus } from './useHomeRandomizerStatus';

interface ProfileFactsInput {
  mode: ProfileModeId;
  romFile: string;
  lastPlayed?: number;
  created?: number;
  windowMode?: string;
}

const buildProfileFacts = (input: ProfileFactsInput): SummaryFact[] => {
  const { mode, romFile, lastPlayed, created, windowMode } = input;
  const romName = romFile.replace(/\.(sfc|smc)$/i, '');
  const facts: SummaryFact[] = [
    { label: 'Mode', value: MODE_BADGE_LABELS[mode] },
    { label: 'ROM', value: romName, title: romFile },
    { label: 'Last played', value: formatRelativeTime(lastPlayed) },
    { label: 'Created', value: formatRelativeTime(created) },
  ];
  if (windowMode) facts.push({ label: 'Window', value: windowMode, capitalize: true });
  return facts;
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
