/* @layer renderer-components @kind hook */
/**
 * Closes the panel on Escape and on a pointer press outside it. A press on the
 * anchor itself is ignored, so the gear button can toggle the panel without the
 * outside-click handler closing it first. The outside-click listener arms after
 * a short delay, so the click that opened the panel never closes it.
 */
import { useEffect } from 'react';
import type { RefObject } from 'react';
import type { AnchorRect } from '../WidgetOptions.type';

const ARM_DELAY_MS = 50;

const insideRect = (x: number, y: number, r: AnchorRect): boolean =>
  x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height;

const useDismiss = (panelRef: RefObject<HTMLElement | null>, anchorRect: AnchorRect, onClose: () => void) => {
  useEffect(() => {
    let armed = false;
    const armTimer = setTimeout(() => { armed = true; }, ARM_DELAY_MS);

    const handler = (e: PointerEvent) => {
      if (!armed) return;
      if (panelRef.current?.contains(e.target as Node)) return;
      if (insideRect(e.clientX, e.clientY, anchorRect)) return;
      onClose();
    };
    document.addEventListener('pointerdown', handler, true);
    return () => {
      clearTimeout(armTimer);
      document.removeEventListener('pointerdown', handler, true);
    };
  }, [panelRef, anchorRect, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);
};

export { useDismiss };
