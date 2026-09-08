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
  /** Present when the caller owns expansion (see GroupTreeProps.expandedKeys). */
  expandedKeys?: ReadonlySet<string>;
  onToggle?: (key: string) => void;
}

const MAX_DEPTH_CLASS = 4;

const GroupSection = <T,>(props: GroupSectionProps<T>) => {
  const { node, depth, expandToDepth, renderItems, expandedKeys, onToggle } = props;
  const [localExpanded, setLocalExpanded] = useState(depth <= expandToDepth);
  const controlled = expandedKeys !== undefined;
  const expanded = controlled ? expandedKeys.has(node.key) : localExpanded;
  const toggle = () => {
    if (controlled) onToggle?.(node.key);
    else setLocalExpanded((v) => !v);
  };

  return (
    <Box className={`group-tree__group group-tree__group--depth-${Math.min(depth, MAX_DEPTH_CLASS)}`}>
      <Button variant="bare" className="group-tree__header" onClick={toggle}>
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
                expandedKeys={expandedKeys}
                onToggle={onToggle}
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
