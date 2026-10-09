/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { GroupNode } from '@shared/game/logic/queries/check-grouping';

const GroupCounts = ({ stats }: { stats: GroupNode['stats'] }) => (
  <Box as="span" className="tracker-group__counts" title="taken / available / left">
    <Text className="tracker-group__count--completed">{stats.completed}</Text>
    <Text className="tracker-group__count-sep"> taken · </Text>
    <Text className="tracker-group__count--reachable">{stats.reachable}</Text>
    <Text className="tracker-group__count-sep"> open · </Text>
    <Text className="tracker-group__count--blocked">{stats.blocked}</Text>
    <Text className="tracker-group__count-sep"> left</Text>
  </Box>
);

export { GroupCounts };
