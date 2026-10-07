/* @layer renderer-components @kind component */
/** The gap between two children of a split, draggable to resize them and double-clickable to even them. */
import { useMemo } from 'react';
import { Box } from '../../../primitives/Box';
import type { LayoutEdit } from '../DockLayout.type';
import type { DividerRect } from '../behavior/layout-tree';
import { rectStyle } from '../behavior/rect-style';
import { useDividerDrag } from '../behavior/useDividerDrag';

interface DividerProps {
  divider: DividerRect;
  onEdit: (edit: LayoutEdit) => void;
}

const Divider = (props: DividerProps) => {
  const { divider, onEdit } = props;
  const { dragging, onPointerDown, onDoubleClick } = useDividerDrag(divider, onEdit);
  const style = useMemo(() => rectStyle(divider.rect), [divider.rect]);
  const cls = [
    'dock-divider',
    `dock-divider--${divider.node.axis}`,
    dragging && 'dock-divider--dragging',
  ].filter(Boolean).join(' ');

  return (
    <Box
      className={cls}
      style={style}
      role="separator"
      aria-orientation={divider.node.axis === 'row' ? 'vertical' : 'horizontal'}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
    />
  );
};

export { Divider };
export type { DividerProps };
