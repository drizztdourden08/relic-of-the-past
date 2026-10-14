/* @layer renderer-components @kind types */
import type { PointerEvent as ReactPointerEvent } from 'react';

interface DragGestureInput<T> {
  resolve: (event: PointerEvent, sourceId: string) => T | null;
  commit: (payload: T, sourceId: string) => void;
  same?: (a: T, b: T) => boolean;
  threshold?: number;
}

interface DragGesture<T> {
  sourceId: string | null;
  payload: T | null;
  start: (event: ReactPointerEvent, sourceId: string) => void;
  cancel: () => void;
}

type CaptureTarget = Partial<Pick<HTMLElement, 'hasPointerCapture' | 'setPointerCapture' | 'releasePointerCapture'>>;

interface Armed { sourceId: string; x: number; y: number; pointerId: number; target: CaptureTarget }

export type { Armed, DragGesture, DragGestureInput };
