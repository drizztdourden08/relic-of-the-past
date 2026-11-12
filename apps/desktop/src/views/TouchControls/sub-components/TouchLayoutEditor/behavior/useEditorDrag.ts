/* @layer renderer-app @kind hook */
import { useRef } from 'react';
import type { PointerEvent } from 'react';
import { DRAG_THRESHOLD_PX } from '../TouchLayoutEditor.constants';
import type { DragApply, DragSession, EditorDragInput } from './useEditorDrag.type';

const useEditorDrag = ({ layout, box, snap, onLayout }: EditorDragInput) => {
  const session = useRef<DragSession | null>(null);

  const begin = (event: PointerEvent<HTMLElement>, apply: DragApply, onTap: () => void) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    session.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      start: layout,
      apply,
      onTap,
      moved: false,
    };
  };

  const move = (event: PointerEvent<HTMLElement>) => {
    const current = session.current;
    if (current?.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (!current.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
    current.moved = true;
    onLayout(current.apply(current.start, { x: dx / box.width, y: dy / box.height }, snap, box));
  };

  const end = (event: PointerEvent<HTMLElement>) => {
    const current = session.current;
    if (current?.pointerId !== event.pointerId) return;
    session.current = null;
    if (!current.moved) current.onTap();
  };

  const cancel = () => {
    session.current = null;
  };

  return { begin, move, end, cancel };
};

export { useEditorDrag };