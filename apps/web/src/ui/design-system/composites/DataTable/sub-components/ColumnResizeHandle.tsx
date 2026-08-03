/* @layer renderer-components @kind component */
/**
 * The seam between one header and the next, made grabbable: a thin strip over
 * the gutter, so it reads as the line between two columns rather than as part
 * of either.
 *
 * It is deliberately NOT `draggable` — the cell around it is, and the whole
 * point is that pulling the seam resizes rather than picks up. The hook behind
 * it stops its pointer events from reaching that cell.
 *
 * It answers a column drag all the same, with its own column's index. The
 * strip covers the gutter, which is exactly the ground a cursor carrying a
 * column crosses on its way from one column to the next — so this is the one
 * place a drop zone cannot afford a hole, and it says so itself rather than
 * leaning on the event reaching the cell behind it.
 */
import { Box } from '../../../primitives/Box';
import type { DragEvent } from 'react';
import type { ColumnResizeBinding } from '../DataTable.type';
import './ColumnResizeHandle.css';

interface ColumnResizeHandleProps {
  /** Named for the screen reader, since the strip itself shows no text. */
  label: string;
  /** The column this seam belongs to — and the slot a drop over it means. */
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
