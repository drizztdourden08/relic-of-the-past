/* @layer website-site @kind logic */
import type { GitHubStats } from '../../../../../github';
import { formatCount } from '../../../../../format';
import type { StatEntry } from '../CommunityStats.type';

const statEntriesOf = (stats: GitHubStats): StatEntry[] => [
  { id: 'stars', icon: 'star', text: `${formatCount(stats.stars)} stars` },
  { id: 'forks', icon: 'git-fork', text: `${formatCount(stats.forks)} forks` },
  { id: 'issues', icon: 'circle-dot', text: `${formatCount(stats.openIssues)} open issues` },
];

export { statEntriesOf };
