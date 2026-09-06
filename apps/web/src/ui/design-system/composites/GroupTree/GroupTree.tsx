/* @layer renderer-components @kind component */
/**
 * Recursive collapsible group tree. The tree owns nesting, expansion and the
 * section headers; the caller owns what a leaf row looks like (`renderItems`)
 * and what a header counts (`node.meta`), so checks and spoiler entries render
 * through the same component without it knowing either shape.
 *
 * A root with no children renders its own items flat — the ungrouped case.
 */
import { Box } from '../../primitives';
import { GroupSection } from './sub-components/GroupSection';
import type { GroupTreeProps } from './GroupTree.type';
import './GroupTree.css';

const GroupTree = <T,>(props: GroupTreeProps<T>) => {
  const { root, renderItems, expandToDepth = 0, className, emptyLabel = 'Nothing to show.' } = props;
  const classes = `group-tree${className ? ` ${className}` : ''}`;

  if (root.children.length > 0) {
    return (
      <Box className={classes}>
        {root.children.map((child) => (
          <GroupSection
            key={child.key}
            node={child}
            depth={1}
            expandToDepth={expandToDepth}
            renderItems={renderItems}
          />
        ))}
      </Box>
    );
  }

  if (root.items.length > 0) return <Box className={classes}>{renderItems(root.items)}</Box>;

  return <Box className={`${classes} group-tree--empty`}>{emptyLabel}</Box>;
};

export { GroupTree };
