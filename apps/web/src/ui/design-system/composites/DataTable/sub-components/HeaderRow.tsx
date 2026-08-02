/* @layer renderer-components @kind component */
/**
 * The sticky header: one cell per visible column, plus a trailing cell that
 * holds nothing. Adding a column is offered by each column's own ⋯ menu, as
 * "before" and "after" — which is where the position comes from — and once
 * more in the footer's menu, which appends. The trailing cell stays as the
 * track that soaks up the row's leftover width; see `trackList`.
 *
 * The remove target used to render here too, detached and pinned to the
 * viewport. It is now a sibling of the whole table rather than of this row —
 * see `ColumnDropTrash` and `DataTable.tsx`.
 */
import { Box } from '../../../primitives/Box';
import { HeaderCell } from './HeaderCell';
import type { SchemaIndex } from '../../../data/schema/build-schema';
import type { SortEntry, TableColumn } from '../../../data/table/types';
import type { IdRefTargetFieldResolver } from '../behavior/display-substitution';
import type { PickerNode } from '../behavior/field-picker-nodes';
import type { ColumnActions, ColumnDragBinding } from '../DataTable.type';

interface HeaderRowProps {
  columns: readonly TableColumn[];
  schema: SchemaIndex;
  /** The addable field tree each cell's ⋯ menu offers as a submenu. */
  fieldNodes: readonly PickerNode[];
  sort: readonly SortEntry[];
  groupBy: readonly string[];
  /** Injected, and only relevant to reference columns — see "Display as…". */
  resolveTargetFields?: IdRefTargetFieldResolver;
  actions: ColumnActions;
  drag: ColumnDragBinding;
  /** A few rows off the top of the rendered order — what each cell's ghost shows. */
  ghostRows: readonly unknown[];
  rowTotal: number;
}

const HeaderRow = (props: HeaderRowProps) => {
  const {
    columns, schema, fieldNodes, sort, groupBy, resolveTargetFields,
    actions, drag, ghostRows, rowTotal,
  } = props;

  return (
    <Box className="data-table__header" role="row">
      {columns.map((column, index) => (
        <HeaderCell
          key={column.path}
          column={column}
          field={schema.byPath(column.path)}
          index={index}
          columnCount={columns.length}
          sortDir={sort.find((entry) => entry.path === column.path)?.dir}
          grouped={groupBy.includes(column.path)}
          fieldNodes={fieldNodes}
          resolveTargetFields={resolveTargetFields}
          actions={actions}
          drag={drag}
          ghostRows={ghostRows}
          rowTotal={rowTotal}
        />
      ))}
      <Box className="data-table__header-cell data-table__header-cell--trailing" role="columnheader" />
    </Box>
  );
};

export { HeaderRow };
export type { HeaderRowProps };
