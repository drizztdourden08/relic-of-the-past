/* @layer renderer-components @kind component */
/**
 * One record. Cell appearance comes from the field kit, so the row never
 * branches on what it shows. A dragged column's cells blank out down the whole
 * table, and every other cell is a live drop target.
 */
import { Box } from '../../../primitives/Box';
import { cellContent } from '../behavior/cell-content';
import { DataCell } from './DataCell';
import { SelectCell } from './SelectCell';
import type { MouseEvent } from 'react';
import type { RowRenderContext } from '../DataTable.type';

interface DataRowProps<T> {
  row: T;
  context: RowRenderContext<T>;
}

const DataRow = <T,>(props: DataRowProps<T>) => {
  const { row, context } = props;
  const {
    columns, schema, draggingPath, getRowId, selectedId, onSelect, selection,
    onCellDragOver, onCellDrop, resolveIdRefDisplay, resolveIdRefDefault,
  } = context;
  const id = getRowId(row);
  const selected = selection ? selection.isSelected(id) : selectedId === id;
  const handleClick = selection
    ? (event: MouseEvent<HTMLElement>) => selection.onRowClick(id, event)
    : onSelect && (() => onSelect(id));

  return (
    <Box
      className={selected ? 'data-table__row data-table__row--selected' : 'data-table__row'}
      role="row"
      aria-selected={selected}
      onClick={handleClick}
      onMouseDown={selection?.onRowMouseDown}
    >
      {selection?.selectable && (
        <SelectCell
          role="gridcell"
          checked={selected}
          ariaLabel="Select row"
          onToggle={(range) => selection.onCheck(id, range)}
        />
      )}
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
            displayField: column.displayField, resolve: resolveIdRefDisplay, resolveDefault: resolveIdRefDefault,
          })}
        </DataCell>
      ))}
    </Box>
  );
};

export { DataRow };
export type { DataRowProps };
