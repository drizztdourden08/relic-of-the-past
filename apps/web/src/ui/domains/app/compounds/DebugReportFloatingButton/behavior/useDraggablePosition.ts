/* @layer renderer-components @kind hook */
/** Drag state for the floating debug-report button. Position is stored as an offset from the
 *  top-right corner (its default spot) so it stays sensible across window resizes, and persists
 *  per-viewer in localStorage: a placement convenience, not data anyone else needs to see. */
import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'debugReportButton.offset';
const DEFAULT_OFFSET = { top: 96, right: 24 };

const readStoredOffset = (): { top: number; right: number } => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_OFFSET;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.top === 'number' && typeof parsed?.right === 'number') return parsed;
  } catch {
    // Fall through to the default.
  }
  return DEFAULT_OFFSET;
};

const useDraggablePosition = () => {
  const [offset, setOffset] = useState(readStoredOffset);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; top: number; right: number } | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragStart.current = { x: e.clientX, y: e.clientY, top: offset.top, right: offset.right };
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [offset]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset({ top: Math.max(4, dragStart.current.top + dy), right: Math.max(4, dragStart.current.right - dx) });
  }, []);

  const onPointerUp = useCallback(() => {
    dragStart.current = null;
    setDragging(false);
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(offset)); } catch { /* best-effort */ }
  }, [offset]);

  return { offset, dragging, onPointerDown, onPointerMove, onPointerUp };
};

export { useDraggablePosition };
