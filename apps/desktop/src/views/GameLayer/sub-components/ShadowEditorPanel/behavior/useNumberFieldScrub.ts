/* @layer renderer-components @kind hook */
import { useCallback, useRef } from 'react';
import type React from 'react';
import { clampValue } from './clamp-value';
import type { NumberFieldScrubParams } from './number-field.type';

const useNumberFieldScrub = (params: NumberFieldScrubParams) => {
  const { value, step, editing, min, max, onChange } = params;
  const scrubRef = useRef({ startX: 0, startVal: 0, active: false });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (editing) return;
    scrubRef.current = { startX: e.clientX, startVal: value, active: true };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [editing, value]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!scrubRef.current.active) return;
    const dx = e.clientX - scrubRef.current.startX;
    const sensitivity = e.shiftKey ? 0.1 : 1;
    const newVal = clampValue(scrubRef.current.startVal + dx * step * sensitivity, min, max);
    onChange(Math.round(newVal / step) * step);
  }, [step, min, max, onChange]);

  const onPointerUp = useCallback(() => {
    scrubRef.current.active = false;
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp };
};

export { useNumberFieldScrub };
