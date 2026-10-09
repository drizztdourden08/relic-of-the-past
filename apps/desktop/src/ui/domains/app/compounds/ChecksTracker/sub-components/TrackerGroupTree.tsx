/* @layer renderer-components @kind component */
import { useCallback, useMemo } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { GroupTree } from '@drizztdourden08/tessera/composites';
import type { TreeNode } from '@drizztdourden08/tessera/composites';
import type { GroupNode } from '@shared/game/logic/queries/check-grouping';
import type { CheckBatch, TrackerGroupTreeProps } from '../ChecksTracker.type';
import { CheckList } from './CheckList';
import { GroupCounts } from './GroupCounts';
import '../ChecksTracker.css';

const toTreeNode = (node: GroupNode): TreeNode<CheckBatch> => ({
  key: node.key,
  label: node.label,
  meta: <GroupCounts stats={node.stats} />,
  children: node.children.map(toTreeNode),
  items: node.checks.length > 0 ? [{ key: node.key, checks: node.checks }] : [],
});

const batchKey = (batch: CheckBatch): string => batch.key;

const toggledKeys = (before: readonly string[], after: readonly string[]): string[] => [
  ...after.filter((key) => !before.includes(key)),
  ...before.filter((key) => !after.includes(key)),
];

const TrackerGroupTree = (props: TrackerGroupTreeProps) => {
  const { node, statuses, eventStatus, viewMode, run, expandedGroups, onToggleGroup } = props;

  const root = useMemo(() => toTreeNode(node), [node]);
  const renderItem = useCallback(
    (batch: CheckBatch) => <CheckList checks={batch.checks} statuses={statuses} eventStatus={eventStatus} viewMode={viewMode} run={run} />,
    [statuses, eventStatus, viewMode, run],
  );
  const handleExpanded = useCallback((next: readonly string[]) => {
    toggledKeys(expandedGroups ?? [], next).forEach((key) => onToggleGroup?.(key));
  }, [expandedGroups, onToggleGroup]);

  return (
    <Box className="tracker-groups">
      <GroupTree
        root={root}
        getItemKey={batchKey}
        renderItem={renderItem}
        showCounts={false}
        emptyLabel="No checks match."
        expandedKeys={expandedGroups}
        onExpandedChange={expandedGroups === undefined ? undefined : handleExpanded}
      />
    </Box>
  );
};

export { TrackerGroupTree };
export type { TrackerGroupTreeProps };
