/* @layer website-site @kind logic */
import type { GitHubStats } from '../../../../../github';
import { formatCount } from '../../../../../format';
import { ICON_PATHS } from '../../../../../icons';
import type { StatEntry } from '../CommunityStats.type';

const statEntriesOf = (stats: GitHubStats): StatEntry[] => [
  { id: 'stars', icon: ICON_PATHS.star, text: `${formatCount(stats.stars)} stars` },
  { id: 'forks', icon: ICON_PATHS.fork, text: `${formatCount(stats.forks)} forks` },
  { id: 'issues', icon: ICON_PATHS.issue, text: `${formatCount(stats.openIssues)} open issues` },
];

export { statEntriesOf };
