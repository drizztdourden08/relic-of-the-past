/* @layer website-site @kind component */
import { Box, Flex, Icon } from '@drizztdourden08/tessera/primitives';
import { ICON_SIZE } from '../../../../icons';
import { statEntriesOf } from './behavior/stat-entries-of';
import type { CommunityStatsProps } from './CommunityStats.type';
import './CommunityStats.css';

const CommunityStats = (props: CommunityStatsProps) => {
  const { stats } = props;

  return (
    <Flex as="ul" wrap justify="center" gap="md" className="landing-stats">
      {statEntriesOf(stats).map((entry) => (
        <Box as="li" key={entry.id} className="landing-stats__item">
          <Icon path={entry.icon} size={ICON_SIZE} />
          {entry.text}
        </Box>
      ))}
    </Flex>
  );
};

export { CommunityStats };
