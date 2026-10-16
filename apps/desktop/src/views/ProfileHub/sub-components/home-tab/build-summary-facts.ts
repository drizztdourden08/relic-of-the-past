/* @layer renderer-components @kind logic */
import { formatDate } from '@drizztdourden08/tessera/primitives';
import type { ProfileFactsInput, SummaryFact } from './home-tab.type';

const agoOf = (ts: number | undefined): string => (ts ? formatDate(ts, 'relative') : 'Never');

const buildProfileFacts = (input: ProfileFactsInput): SummaryFact[] => {
  const { romFile, lastPlayed, created } = input;
  const romName = romFile.replace(/\.(sfc|smc)$/i, '');
  return [
    { label: 'ROM', value: romName, title: romFile },
    { label: 'Last played', value: agoOf(lastPlayed) },
    { label: 'Created', value: agoOf(created) },
  ];
};

export { buildProfileFacts };
