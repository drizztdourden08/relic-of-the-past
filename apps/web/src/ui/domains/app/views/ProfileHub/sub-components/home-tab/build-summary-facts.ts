/* @layer renderer-components @kind logic */
import { formatRelativeTime } from './format-relative-time';
import type { ProfileFactsInput, SummaryFact } from './home-tab.type';

const buildProfileFacts = (input: ProfileFactsInput): SummaryFact[] => {
  const { romFile, lastPlayed, created } = input;
  const romName = romFile.replace(/\.(sfc|smc)$/i, '');
  return [
    { label: 'ROM', value: romName, title: romFile },
    { label: 'Last played', value: formatRelativeTime(lastPlayed) },
    { label: 'Created', value: formatRelativeTime(created) },
  ];
};

export { buildProfileFacts };
