/* @layer renderer-components @kind component */
import { useCallback, useMemo } from 'react';
import { Box } from '@ds/primitives';
import { GroupTree } from '@ds/composites/GroupTree';
import type { TreeNode } from '@ds/composites/GroupTree';
import type { CheckRecord } from '@shared/game/data';
import type { GroupNode } from '@shared/game/logic/queries/check-grouping';
import type { TrackerGroupTreeProps } from '../ChecksTracker.type';
import { CheckList } from './CheckList';
import { GroupCounts } from './GroupCounts';
import '../ChecksTracker.css';

const toTreeNode = (node: GroupNode): TreeNode<CheckRecord> => ({
  key: node.key,
  label: node.label,
  meta: <GroupCounts stats={node.stats} />,
  children: node.children.map(toTreeNode),
  items: node.checks,
});

const TrackerGroupTree = (props: TrackerGroupTreeProps) => {
  const { node, statuses, eventStatus, viewMode, run, expandedGroups, onToggleGroup } = props;

  const root = useMemo(() => toTreeNode(node), [node]);
  const renderItems = useCallback(
    (checks: CheckRecord[]) => <CheckList checks={checks} statuses={statuses} eventStatus={eventStatus} viewMode={viewMode} run={run} />,
    [statuses, eventStatus, viewMode, run],
  );

  return (
    <Box className="tracker-groups">
      <GroupTree
        root={root}
        renderItems={renderItems}
        emptyLabel="No checks match."
        expandedKeys={expandedGroups}
        onToggleKey={onToggleGroup}
      />
    </Box>
  );
};

export { TrackerGroupTree };
export type { TrackerGroupTreeProps };
