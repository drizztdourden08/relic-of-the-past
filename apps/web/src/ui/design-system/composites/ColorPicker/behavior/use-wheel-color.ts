/* @layer renderer-components @kind hook */
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { hexToRgb } from './color-math';

/** Any colour shape react-color's `toState` accepts. */
type WheelColor =
  | string
  | { r: number; g: number; b: number; a?: number }
  | { h: number; s: number; l: number; a?: number };

/**
 * Decides what colour the wheel is shown, so a consumer that stores something other than
 * what it was handed cannot drag the pointer out from under the cursor.
 *
 * react-color's `ColorWrap` re-derives its ENTIRE state from the `color` prop inside
 * `getDerivedStateFromProps` — which React runs on every render, not only when that prop
 * changes. The wheel therefore has no state of its own that survives a render: wherever
 * `color` points is where the pointer lands, every frame. A consumer that quantises what
 * it receives (this project's sheet palettes are five bits per channel, so most colours
 * snap to a neighbour) hands back a different colour than the one just sent, and the
 * pointer is yanked to the snapped position on every drag step instead of following the
 * mouse.
 *
 * Note the corollary, which is why simply ignoring the consumer mid-drag does not work:
 * holding `color` still freezes the pointer in place, because the wheel cannot move
 * without the prop moving. So during a drag the wheel is fed its OWN un-quantised output
 * — it lands exactly where the mouse is — and on release it resyncs once to whatever the
 * consumer actually stored, which is the honest thing to show at rest. Outside a drag
 * every external change (a swatch, Reset, a typed hex) seeds through immediately.
 *
 * The wheel's own output is taken as HSL rather than hex because hue is not recoverable
 * from a hex whose saturation or lightness has reached zero, and losing it would swing
 * the hue strip to red the moment a drag touched the bottom or left edge.
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
