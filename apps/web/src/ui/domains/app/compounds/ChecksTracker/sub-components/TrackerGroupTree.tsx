/* @layer renderer-components @kind component */
/**
 * Adapts the check group tree onto the shared GroupTree composite: the tree
 * owns nesting and expansion, this file owns what a check group counts in its
 * header and what a check row looks like.
 */
import { useCallback, useMemo } from 'react';
import { Box, Text } from '@ds/primitives';
import { GroupTree } from '@ds/composites/GroupTree';
import type { TreeNode } from '@ds/composites/GroupTree';
import type { CheckRecord } from '@shared/game/data';
import type { CheckStatus } from '@shared/game/logic/eval';
import type { GroupNode, RunContext } from '@shared/game/logic/queries/check-grouping';
import type { ViewMode } from './TrackerFilters';
import { CheckList } from './CheckList';
import '../ChecksTracker.css';

interface TrackerGroupTreeProps {
  node: GroupNode;
  statuses: Map<string, CheckStatus>;
  viewMode: ViewMode;
  run?: RunContext;
}

/** taken / available / still to find — the same three the summary bar counts. */
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

const toTreeNode = (node: GroupNode): TreeNode<CheckRecord> => ({
  key: node.key,
  label: node.label,
  meta: <GroupCounts stats={node.stats} />,
  children: node.children.map(toTreeNode),
  items: node.checks,
});

const TrackerGroupTree = (props: TrackerGroupTreeProps) => {
  const { node, statuses, viewMode, run } = props;

  const root = useMemo(() => toTreeNode(node), [node]);
  const renderItems = useCallback(
    (checks: CheckRecord[]) => <CheckList checks={checks} statuses={statuses} viewMode={viewMode} run={run} />,
    [statuses, viewMode, run],
  );

  return (
    <Box className="tracker-groups">
      <GroupTree root={root} renderItems={renderItems} emptyLabel="No checks match." />
    </Box>
  );
};

export { TrackerGroupTree };
export type { TrackerGroupTreeProps };
