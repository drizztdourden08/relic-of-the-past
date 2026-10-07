/* @layer renderer-components @kind component */
/**
 * Renders the `GroupedRow` tree. With no grouping it is a flat list of leaves,
 * so one walk covers both cases. A collapsed branch is not rendered.
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

  /* The group header honours the display choice set on that column. A path with
     no column on screen reads as the raw key. */
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
