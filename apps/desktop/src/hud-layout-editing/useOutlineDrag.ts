/* @layer renderer-components @kind hook */
import { useRef } from 'react';
import { ghostFor } from './drop-ghost';
import { outlineIntent } from './drop-intent';
import { rowUnder } from './row-under';
import { useDragAutoScroll } from './use-drag-autoscroll';
import { useDragGesture } from './useDragGesture';
import { useSpringLoad } from './useSpringLoad';
import type { DropPreview } from '@app/views/HudLayoutEditor/sub-components/OutlinePanel.type';
import type { OutlineDragInput } from './outline-drag.type';

const samePreview = (a: DropPreview, b: DropPreview): boolean =>
  a.rowId === b.rowId && a.zone === b.zone && a.intent.kind === b.intent.kind;

const useOutlineDrag = (input: OutlineDragInput) => {
  const { doc, onDrop, rowsRef } = input;
  const settle = useRef<((parentId: string | null) => void) | null>(null);
  const drag = useDragGesture<DropPreview>({
    resolve: (event, sourceId) => {
      const at = rowUnder(doc, event.clientX, event.clientY);
      return at ? { ...at, intent: outlineIntent(doc, at.rowId, at.zone, [sourceId]) } : null;
    },
    commit: (preview, sourceId) => {
      settle.current?.(preview.intent.kind === 'refused' ? null : preview.intent.parentId);
      onDrop([sourceId], preview.intent);
    },
    same: samePreview,
  });
  const dragging = drag.sourceId !== null;
  const spring = useSpringLoad({ doc, active: dragging, rowId: drag.payload?.rowId ?? null });
  settle.current = spring.landed;
  useDragAutoScroll({ active: dragging, anchor: rowsRef });
  const preview = drag.payload && drag.payload.intent.kind !== 'refused' ? drag.payload : null;
  const ghost = drag.sourceId && drag.payload ? ghostFor(doc, [drag.sourceId], drag.payload.intent) : null;

  return { drag, spring, dragging, preview, ghost };
};

export { useOutlineDrag };
