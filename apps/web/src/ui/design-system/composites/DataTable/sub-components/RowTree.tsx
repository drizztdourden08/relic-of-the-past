/* @layer renderer-components @kind component */
/**
 * Renders exactly what the headless hook produced: a `GroupedRow` tree whose
 * group nodes nest and whose leaves are records. With no grouping the tree is
 * a flat list of leaves, so this one walk covers both cases and the table never
 * has to branch on "grouped or not".
 *
 * A collapsed branch is simply not rendered — the subtree is still in hand,
 * which is why the core hands over a tree rather than a pre-flattened list.
 */
import { Fragment } from 'react';
import { DataRow } from './DataRow';
import { GroupRow } from './GroupRow';
import { groupUid } from '../behavior/group-uid';
import type { GroupedRow } from '../../../data/table/types';
import type { RowRenderContext } from '../DataTable.type';

interface RowTreeProps<T> {
  nodes: readonly GroupedRow<T>[];
  parentUid: string;
  context: RowRenderContext<T>;
}

const RowTree = <T,>(props: RowTreeProps<T>) => {
  const { nodes, parentUid, context } = props;
  const { columns, schema, getRowId, isExpanded, onToggleGroup, resolveIdRefDisplay, resolveIdRefDefault } = context;

  /*
   * A grouping level is a COLUMN's grouping level, so the display choice the
   * header honours is the one set on that column — looked up by the path the
   * group node already carries. Grouping by a path with no column on screen
   * finds nothing and the header reads as the raw key, which is right.
   */
  const displayFor = (path: string) => ({
    displayField: columns.find((column) => column.path === path)?.displayField,
    resolve: resolveIdRefDisplay,
    resolveDefault: resolveIdRefDefault,
  });

  return (
    <>
      {nodes.map((node, index) => {
        if (node.kind === 'row') {
          return <DataRow key={getRowId(node.row)} row={node.row} context={context} />;
        }
        const uid = groupUid(parentUid, node.path, node.key);
        const expanded = isExpanded(uid);
        return (
          <Fragment key={`${uid}#${index}`}>
            <GroupRow
              level={node.level}
              groupKey={node.key}
              field={schema.byPath(node.path)}
              count={node.count}
              expanded={expanded}
              onToggle={() => onToggleGroup(uid)}
              display={displayFor(node.path)}
            />
            {expanded && <RowTree nodes={node.children} parentUid={uid} context={context} />}
          </Fragment>
        );
      })}
    </>
  );
};

export { RowTree };
export type { RowTreeProps };
