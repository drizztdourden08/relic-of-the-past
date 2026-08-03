/* @layer renderer-components @kind component */
/**
 * One value in one row — and, while a column is in the air, one square of that
 * column's drop target.
 *
 * That second job is why this is a component rather than a `<Box>` inline in
 * the row: a cell already knows which column it belongs to, so it can answer a
 * drag with the same index its header would and the drop zone becomes the whole
 * column, top to bottom, with no pointer arithmetic anywhere. Dragging over the
 * body of a column now does exactly what dragging over its header does.
 */
import { Box } from '../../../primitives/Box';
import type { DragEvent, ReactNode } from 'react';

interface DataCellProps {
  /** The column's path — also what "fit to content" measures this cell by. */
  path: string;
  /** The column's position, which is what a drop here means. */
  index: number;
  /** This cell's column is the one being carried, so it empties out with it. */
  dragging: boolean;
  onDragOver?: (index: number, event: DragEvent<HTMLElement>) => void;
  onDrop?: (index: number, event: DragEvent<HTMLElement>) => void;
  children: ReactNode;
}

const DataCell = (props: DataCellProps) => {
  const { path, index, dragging, onDragOver, onDrop, children } = props;

  return (
    <Box
      className={dragging ? 'data-table__cell data-table__cell--dragging' : 'data-table__cell'}
      role="gridcell"
      data-column={path}
      onDragOver={onDragOver && ((event: DragEvent<HTMLElement>) => onDragOver(index, event))}
      onDrop={onDrop && ((event: DragEvent<HTMLElement>) => onDrop(index, event))}
    >
      {children}
    </Box>
  );
};

export { DataCell };
export type { DataCellProps };
