/* @layer website-site @kind types */
import type { IconName } from '@drizztdourden08/tessera/primitives';
import type { GitHubStats } from '../../../../github';

type CommunityStatsProps = {
  stats: GitHubStats;
};

type StatEntry = {
  id: string;
  icon: IconName;
  text: string;
};

export type { CommunityStatsProps, StatEntry };
