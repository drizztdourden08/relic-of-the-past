/* @layer renderer-components @kind hook */
/**
 * One pointerdown listener on the stage drives every drag: a widget by its
 * title bar, one tab out of a pane, or the game by its grip. After a short
 * travel the drag goes live, captures the pointer and publishes a DragView
 * for the overlay; a release turns into one LayoutEdit for the host, or a
 * pop-out past the window's edge. Escape cancels.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import type { WidgetId } from '@shared/types/widget-layout';
import type { LayoutEdit } from '../DockLayout.type';
import { movedEnough, resolveDrop, viewFor } from './drag-resolve';
import { handleOf, sourceFrom } from './drag-source';
import type { DragContext, DragSource, DragView, Point } from './drag-types';

interface DockDragParams {
  stageRef: RefObject<HTMLElement | null>;
  context: DragContext;
  onEdit: (edit: LayoutEdit) => void;
  onPopOut?: (id: WidgetId) => void;
}

interface Press {
  source: DragSource;
  pointerId: number;
  live: boolean;
  view: DragView | null;
}

const stagePoint = (stage: HTMLElement, e: { clientX: number; clientY: number }): Point => {
  const box = stage.getBoundingClientRect();
  return { x: e.clientX - box.left, y: e.clientY - box.top };
};

const useDockDrag = (params: DockDragParams) => {
  const { stageRef, context, onEdit, onPopOut } = params;
  const [drag, setDrag] = useState<DragView | null>(null);
  const [dragId, setDragId] = useState<WidgetId | null>(null);
  const press = useRef<Press | null>(null);
  const detach = useRef<(() => void) | null>(null);
  const latest = useRef({ context, onEdit, onPopOut });
  latest.current = { context, onEdit, onPopOut };

  const finish = useCallback(() => {
    const stage = stageRef.current;
    const p = press.current;
    if (stage && p?.live && stage.hasPointerCapture(p.pointerId)) stage.releasePointerCapture(p.pointerId);
    detach.current?.();
    detach.current = null;
    press.current = null;
    setDrag(null);
    setDragId(null);
  }, [stageRef]);

  useEffect(() => () => detach.current?.(), []);

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const stage = stageRef.current;
    if (e.button !== 0 || !stage || press.current) return;
    const handle = handleOf(e.target);
    if (!handle) return;
    const box = stage.getBoundingClientRect();
    const origin = { x: box.left, y: box.top };
    const source = sourceFrom(handle, latest.current.context, origin, stagePoint(stage, e));
    if (!source) return;
    e.preventDefault();
    press.current = { source, pointerId: e.pointerId, live: false, view: null };

    const onMove = (ev: PointerEvent): void => {
      const p = press.current;
      if (!p || ev.pointerId !== p.pointerId) return;
      const point = stagePoint(stage, ev);
      if (!p.live) {
        if (!movedEnough(p.source.start, point)) return;
        p.live = true;
        stage.setPointerCapture(p.pointerId);
        setDragId(p.source.id);
      }
      const held = { shift: ev.shiftKey, ctrl: ev.ctrlKey };
      p.view = viewFor(latest.current.context, p.source, point, { x: ev.clientX, y: ev.clientY }, held);
      setDrag(p.view);
    };
    const onUp = (ev: PointerEvent): void => {
      const p = press.current;
      if (!p || ev.pointerId !== p.pointerId) return;
      const { source, live, view } = p;
      finish();
      if (!live) {
        if (source.fromTab && source.fromKey && source.id) {
          latest.current.onEdit({ type: 'activate-tab', key: source.fromKey, id: source.id });
        }
        return;
      }
      if (!view) return;
      const result = resolveDrop(source, view);
      if (result.popOut) latest.current.onPopOut?.(result.popOut);
      else if (result.edit) latest.current.onEdit(result.edit);
    };
    const onKey = (ev: KeyboardEvent): void => {
      if (ev.key === 'Escape') finish();
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', finish);
    window.addEventListener('keydown', onKey);
    detach.current = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', finish);
      window.removeEventListener('keydown', onKey);
    };
  }, [stageRef, finish]);

  return { drag, dragId, onPointerDown };
};

export { useDockDrag };
export type { DockDragParams };
