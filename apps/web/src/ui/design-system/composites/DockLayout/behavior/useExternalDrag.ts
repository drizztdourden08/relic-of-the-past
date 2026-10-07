/* @layer renderer-components @kind hook */
/**
 * Follows a widget's own window as it is dragged over the stage: turns the
 * window point the host reports into a stage point, builds the drop view for
 * the overlay, and on the release answers with the edit it resolved to.
 */
import { useEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import type { WidgetId } from '@shared/types/widget-layout';
import type { DockLayoutProps, LayoutEdit } from '../DockLayout.type';
import type { DragContext, DragView } from './drag-types';
import { externalDrop, externalView } from './external-drag';

interface ExternalDragParams {
  stageRef: RefObject<HTMLElement | null>;
  context: DragContext;
  externalDrag: DockLayoutProps['externalDrag'];
  onExternalDrop?: (id: WidgetId, edit: LayoutEdit | null) => void;
  sizeOf?: (id: WidgetId) => { width: number; height: number };
}

const useExternalDrag = (params: ExternalDragParams): DragView | null => {
  const { stageRef, context, externalDrag, onExternalDrop, sizeOf } = params;
  const latest = useRef({ context, onExternalDrop, sizeOf });
  latest.current = { context, onExternalDrop, sizeOf };

  const drag = useMemo(() => {
    const stage = stageRef.current;
    if (!externalDrag || !stage) return null;
    const box = stage.getBoundingClientRect();
    return { id: externalDrag.id, pointer: { x: externalDrag.point.x - box.left, y: externalDrag.point.y - box.top } };
  }, [externalDrag, stageRef]);

  const view = useMemo(
    () => (drag && !externalDrag?.released ? externalView(context, drag, sizeOf?.(drag.id)) : null),
    [drag, externalDrag?.released, context, sizeOf],
  );

  useEffect(() => {
    if (!drag || !externalDrag?.released) return;
    const { context: ctx, onExternalDrop: answer, sizeOf: size } = latest.current;
    const result = externalDrop(ctx, drag, size?.(drag.id));
    answer?.(drag.id, result.edit ?? null);
  }, [drag, externalDrag?.released]);

  return view;
};

export { useExternalDrag };
