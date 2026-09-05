/* @layer renderer-components @kind component */
/** The sticky header: one cell per visible column, plus an empty trailing cell that soaks up leftover width (see `trackList`). */
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
  /** Injected, and only relevant to reference columns (the "Display as" submenu). */
  resolveTargetFields?: IdRefTargetFieldResolver;
  actions: ColumnActions;
  drag: ColumnDragBinding;
  /** A few rows off the top of the rendered order. Each cell's ghost shows them. */
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
