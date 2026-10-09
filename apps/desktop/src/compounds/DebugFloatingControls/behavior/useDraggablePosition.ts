/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_OFFSET, STORAGE_KEY } from './useDraggablePosition.constants';

const readStoredOffset = (): { top: number; right: number } => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_OFFSET;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.top === 'number' && typeof parsed?.right === 'number') return parsed;
  } catch {
    return DEFAULT_OFFSET;
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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(offset));
    } catch {
      return;
    }
  }, [offset]);

  return { offset, dragging, onPointerDown, onPointerMove, onPointerUp };
};

export { useDraggablePosition };
