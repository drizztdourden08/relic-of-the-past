/* @layer renderer-components @kind component */
/**
 * One value in one row, and one square of its column's drop target while a
 * column is in the air. A cell answers a drag with the same index its header would.
 */
import { Box } from '../../../primitives/Box';
import type { DragEvent, ReactNode } from 'react';

interface DataCellProps {
  /** The column's path. "Fit to content" measures this cell by it. */
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
