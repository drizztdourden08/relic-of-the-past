/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import { STORAGE_KEY } from './useDraggablePosition.constants';
import { readStoredOffset } from './stored-offset';

const offsetStorageUnavailable = (): void => undefined;

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
      offsetStorageUnavailable();
    }
  }, [offset]);

  return { offset, dragging, onPointerDown, onPointerMove, onPointerUp };
};

export { useDraggablePosition };
