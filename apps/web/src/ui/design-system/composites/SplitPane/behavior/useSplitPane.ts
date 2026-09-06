/* @layer renderer-components @kind hook */
/**
 * Drag state for a two-pane split. The ratio is the START pane's share of the
 * track; dragging below the snap threshold on either side collapses that pane
 * instead of squeezing it, and dragging back past the threshold restores it —
 * so the divider never has to be released in an unusable position.
 *
 * Pointer capture keeps the drag alive when the cursor leaves the divider,
 * which it always does the moment the drag starts.
 */
import { useCallback, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { CollapsedSide } from '../SplitPane.type';

/** One arrow-key press, as a share of the track. */
const KEY_STEP = 0.02;

const clamp = (value: number): number => Math.min(1, Math.max(0, value));

const useSplitPane = (defaultRatio: number, snapAt: number, defaultCollapsed: CollapsedSide = 'none') => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(defaultRatio);
  const [collapsed, setCollapsed] = useState<CollapsedSide>(defaultCollapsed);
  const [dragging, setDragging] = useState(false);

  /** Applies a proposed ratio, collapsing rather than shrinking past the snap. */
  const apply = useCallback((next: number) => {
    if (next < snapAt) {
      setCollapsed('start');
      return;
    }
    if (next > 1 - snapAt) {
      setCollapsed('end');
      return;
    }
    setCollapsed('none');
    setRatio(clamp(next));
  }, [snapAt]);

  const ratioAt = useCallback((clientX: number): number => {
    const track = trackRef.current;
    if (!track) return ratio;
    const rect = track.getBoundingClientRect();
    return rect.width > 0 ? (clientX - rect.left) / rect.width : ratio;
  }, [ratio]);

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  }, []);

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    apply(ratioAt(event.clientX));
  }, [apply, dragging, ratioAt]);

  const endDrag = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
  }, []);

  /** Arrow keys nudge; Home/End collapse; Enter restores an even split. */
  const handleKeyDown = useCallback((event: ReactKeyboardEvent<HTMLDivElement>) => {
    const current = collapsed === 'start' ? 0 : collapsed === 'end' ? 1 : ratio;
    if (event.key === 'ArrowLeft') apply(current - KEY_STEP);
    else if (event.key === 'ArrowRight') apply(current + KEY_STEP);
    else if (event.key === 'Home') setCollapsed('start');
    else if (event.key === 'End') setCollapsed('end');
    else if (event.key === 'Enter' || event.key === ' ') { setCollapsed('none'); setRatio(defaultRatio); }
    else return;
    event.preventDefault();
  }, [apply, collapsed, defaultRatio, ratio]);

  const expand = useCallback(() => {
    setCollapsed('none');
    setRatio(defaultRatio);
  }, [defaultRatio]);

  return {
    trackRef, ratio, collapsed, dragging, expand,
    handlePointerDown, handlePointerMove, endDrag, handleKeyDown,
  };
};

export { useSplitPane };
