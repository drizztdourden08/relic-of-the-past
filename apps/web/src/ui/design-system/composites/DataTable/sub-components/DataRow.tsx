/* @layer renderer-components @kind component */
/**
 * One record. Every cell's appearance comes from the field kit for that field's
 * kind, so the row itself never branches on what it is showing.
 *
 * The one exception is a column being dragged: its cells blank out down the
 * whole table, so the hole the header shows runs the full height rather than
 * stopping at the header row — and every OTHER cell in the row is a live drop
 * target for that drag, which is what makes the whole table, and not just its
 * header, somewhere a column can be dropped.
 */
import { Box } from '../../../primitives/Box';
import { cellContent } from '../behavior/cell-content';
import { DataCell } from './DataCell';
import type { RowRenderContext } from '../DataTable.type';

interface DataRowProps<T> {
  row: T;
  context: RowRenderContext<T>;
}

const DataRow = <T,>(props: DataRowProps<T>) => {
  const { row, context } = props;
  const {
    columns, schema, draggingPath, getRowId, selectedId, onSelect,
    onCellDragOver, onCellDrop, resolveIdRefDisplay,
  } = context;
  const id = getRowId(row);
  const selected = selectedId === id;

  return (
    <Box
      className={selected ? 'data-table__row data-table__row--selected' : 'data-table__row'}
      role="row"
      aria-selected={selected}
      onClick={onSelect ? () => onSelect(id) : undefined}
    >
      {columns.map((column, index) => (
        <DataCell
          key={column.path}
          path={column.path}
          index={index}
          dragging={column.path === draggingPath}
          onDragOver={onCellDragOver}
          onDrop={onCellDrop}
        >
          {cellContent(row, column.path, schema.byPath(column.path), {
            displayField: column.displayField, resolve: resolveIdRefDisplay,
          })}
        </DataCell>
      ))}
    </Box>
  );
};

export { DataRow };
export type { DataRowProps };
