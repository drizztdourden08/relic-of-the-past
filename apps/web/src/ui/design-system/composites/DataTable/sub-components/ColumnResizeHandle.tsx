/* @layer renderer-components @kind component */
/**
 * The grabbable seam between two headers. Deliberately not `draggable`: pulling
 * it resizes, never picks up. It still answers a column drag with its own
 * column's index, since the gutter is the ground a carried column crosses.
 */
import { Box } from '../../../primitives/Box';
import type { DragEvent } from 'react';
import type { ColumnResizeBinding } from '../DataTable.type';
import './ColumnResizeHandle.css';

interface ColumnResizeHandleProps {
  /** Named for the screen reader, since the strip itself shows no text. */
  label: string;
  /** The column this seam belongs to. A drop over it lands in that slot. */
  index: number;
  resize: ColumnResizeBinding;
  onDragOver?: (index: number, event: DragEvent<HTMLElement>) => void;
  onDrop?: (index: number, event: DragEvent<HTMLElement>) => void;
}

const ColumnResizeHandle = (props: ColumnResizeHandleProps) => {
  const { label, index, resize, onDragOver, onDrop } = props;
  const { resizing, onPointerDown, onPointerMove, onPointerUp } = resize;

  return (
    <Box
      className={resizing ? 'data-table__resize data-table__resize--active' : 'data-table__resize'}
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${label}`}
      draggable={false}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDragOver={onDragOver && ((event: DragEvent<HTMLElement>) => onDragOver(index, event))}
      onDrop={onDrop && ((event: DragEvent<HTMLElement>) => onDrop(index, event))}
    />
  );
};

export { ColumnResizeHandle };
export type { ColumnResizeHandleProps };
