/* @layer renderer-components @kind component */
/**
 * One collapsible section of the tree, and the recursion point: a section whose
 * node has children renders more sections, otherwise it renders its leaves
 * through the caller's `renderItems`.
 */
import { useState } from 'react';
import { Box, Button, Text } from '../../../primitives';
import type { ReactNode } from 'react';
import type { TreeNode } from '../GroupTree.type';

interface GroupSectionProps<T> {
  node: TreeNode<T>;
  depth: number;
  expandToDepth: number;
  renderItems: (items: T[]) => ReactNode;
}

const MAX_DEPTH_CLASS = 4;

const GroupSection = <T,>(props: GroupSectionProps<T>) => {
  const { node, depth, expandToDepth, renderItems } = props;
  const [expanded, setExpanded] = useState(depth <= expandToDepth);

  return (
    <Box className={`group-tree__group group-tree__group--depth-${Math.min(depth, MAX_DEPTH_CLASS)}`}>
      <Button variant="bare" className="group-tree__header" onClick={() => setExpanded(!expanded)}>
        <Text className="group-tree__chevron">{expanded ? '▼' : '▶'}</Text>
        <Text className="group-tree__name">{node.label}</Text>
        {node.meta !== undefined && <Text className="group-tree__meta">{node.meta}</Text>}
      </Button>
      {expanded && (
        <Box className="group-tree__content">
          {node.children.length > 0
            ? node.children.map((child) => (
              <GroupSection
                key={child.key}
                node={child}
                depth={depth + 1}
                expandToDepth={expandToDepth}
                renderItems={renderItems}
              />
            ))
            : renderItems(node.items)}
        </Box>
      )}
    </Box>
  );
};

export { GroupSection };
export type { GroupSectionProps };
