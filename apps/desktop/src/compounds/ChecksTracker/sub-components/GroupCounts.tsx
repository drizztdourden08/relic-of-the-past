/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { GroupNode } from '@rotp/game-data';
import './GroupCounts.css';

const Separator = () => <Text tone="faint">·</Text>;

const GroupCounts = ({ stats }: { stats: GroupNode['stats'] }) => {
  const t = useT();
  return (
    <Box as="span" className="tracker-group__counts" title={t('compounds:tracker.group.title')}>
      <Text className="tracker-group__count--completed">{t('compounds:tracker.group.taken', { count: stats.completed })}</Text>
      <Separator />
      <Text className="tracker-group__count--reachable">{t('compounds:tracker.group.open', { count: stats.reachable })}</Text>
      <Separator />
      <Text className="tracker-group__count--blocked">{t('compounds:tracker.group.left', { count: stats.blocked })}</Text>
    </Box>
  );
};

export { GroupCounts };
