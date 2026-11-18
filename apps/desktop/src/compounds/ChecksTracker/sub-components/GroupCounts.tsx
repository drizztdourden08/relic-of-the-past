/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { GroupNode } from '@rotp/game-data';
import './GroupCounts.css';

const GroupCounts = ({ stats }: { stats: GroupNode['stats'] }) => {
  const t = useT();
  return (
  <Box as="span" className="tracker-group__counts" title={t('compounds:tracker.group.title')}>
    <Text className="tracker-group__count--completed">{stats.completed}</Text>
    <Text tone="faint">{t('compounds:tracker.group.taken')}</Text>
    <Text className="tracker-group__count--reachable">{stats.reachable}</Text>
    <Text tone="faint">{t('compounds:tracker.group.open')}</Text>
    <Text className="tracker-group__count--blocked">{stats.blocked}</Text>
    <Text tone="faint">{t('compounds:tracker.group.left')}</Text>
  </Box>
  );
};

export { GroupCounts };
