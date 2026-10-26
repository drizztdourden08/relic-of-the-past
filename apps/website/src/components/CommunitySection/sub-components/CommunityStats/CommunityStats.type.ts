/* @layer website-site @kind types */
import type { IconPath } from '@drizztdourden08/tessera';
import type { GitHubStats } from '../../../../github';

type CommunityStatsProps = {
  stats: GitHubStats;
};

type StatEntry = {
  id: string;
  icon: IconPath;
  text: string;
};

export type { CommunityStatsProps, StatEntry };
