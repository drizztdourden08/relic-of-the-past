/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { GroupNode } from '@rotp/game-data';
import './GroupCounts.css';

const GroupCounts = ({ stats }: { stats: GroupNode['stats'] }) => (
  <Box as="span" className="tracker-group__counts" title="taken / available / left">
    <Text className="tracker-group__count--completed">{stats.completed}</Text>
    <Text tone="faint"> taken · </Text>
    <Text className="tracker-group__count--reachable">{stats.reachable}</Text>
    <Text tone="faint"> open · </Text>
    <Text className="tracker-group__count--blocked">{stats.blocked}</Text>
    <Text tone="faint"> left</Text>
  </Box>
);

export { GroupCounts };
