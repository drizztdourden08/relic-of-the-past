/* @layer renderer-components @kind component */
/**
 * The seam itself. A thin strip you grab to resize whatever sits beside it.
 * Pairs with `useResize`; this component owns no state and no store, only the
 * binding it is handed.
 *
 * Lifted out of `DataTable`'s own `ColumnResizeHandle` so a second, drifting
 * copy of the same gesture never gets written for the next panel that needs
 * one. See `use-resize.ts`'s own header for why pointer events, not the
 * HTML5 drag API.
 */
import { Box } from '../Box';
import type { ResizeHandleProps } from './ResizeHandle.type';
import './ResizeHandle.css';

const ResizeHandle = (props: ResizeHandleProps) => {
  const { label, axis, resize } = props;
  const { resizing, onPointerDown, onPointerMove, onPointerUp } = resize;

  return (
    <Box
      className={resizing ? 'ds-resize-handle ds-resize-handle--active' : 'ds-resize-handle'}
      data-axis={axis}
      role="separator"
      aria-orientation={axis === 'horizontal' ? 'vertical' : 'horizontal'}
      aria-label={label}
      draggable={false}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    />
  );
};

export { ResizeHandle };
export type { ResizeHandleProps };
