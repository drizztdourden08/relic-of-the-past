/* @layer renderer-components @kind hook */
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { hexToRgb } from './color-math';

/** Any colour shape react-color's `toState` accepts. */
type WheelColor =
  | string
  | { r: number; g: number; b: number; a?: number }
  | { h: number; s: number; l: number; a?: number };

/**
 * Decides what colour the wheel is shown. `ColorWrap` re-derives its whole
 * state from the `color` prop on every render, so a consumer that quantises
 * (sheet palettes are five bits per channel) would yank the pointer to the
 * snapped colour on every drag step. Holding `color` still would freeze the
 * pointer instead. So during a drag the wheel is fed its own un-quantised
 * output, and on release it resyncs once to what the consumer stored. The
 * output is kept as HSL: hue is not recoverable from a hex at zero saturation
 * or lightness.
 */
const useWheelColor = (value: string, alpha: number, disableAlpha: boolean) => {
  const external = useMemo<WheelColor>(
    () => (disableAlpha ? value : { ...hexToRgb(value), a: alpha }),
    [disableAlpha, value, alpha],
  );

  const [seed, setSeed] = useState<WheelColor>(external);
  const dragging = useRef(false);

  // Read on mouseup, which fires outside React's render pass and so cannot close over
  // the render that installed the listener.
  const latest = useRef<WheelColor>(external);
  latest.current = external;

  useEffect(() => {
    if (!dragging.current) setSeed(external);
  }, [external]);

  // One listener for the component's lifetime: a drag can end anywhere on the page, and
  // binding per-drag would strand a listener whenever the picker closes mid-drag.
  useEffect(() => {
    const release = () => {
      if (!dragging.current) return;
      dragging.current = false;
      setSeed(latest.current);
    };
    window.addEventListener('mouseup', release);
    return () => window.removeEventListener('mouseup', release);
  }, []);

  // Bound on the CAPTURE phase by the caller, so the flag is already set by the time
  // react-color's own mousedown handler positions the pointer for the initial click.
  const beginDrag = useCallback(() => { dragging.current = true; }, []);

  const followWheel = useCallback((c: WheelColor) => {
    if (dragging.current) setSeed(c);
  }, []);

  return { seed, beginDrag, followWheel };
};

export { useWheelColor };
export type { WheelColor };
