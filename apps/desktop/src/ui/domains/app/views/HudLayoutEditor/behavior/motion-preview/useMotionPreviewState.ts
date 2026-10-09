/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_SPAN_MS } from './motion-preview.constants';
import type { MotionPreview } from './motion-preview.type';

const useMotionPreviewState = (disabled: boolean): MotionPreview => {
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [spanMs, setSpanMs] = useState(DEFAULT_SPAN_MS);
  const spanRef = useRef(spanMs);
  spanRef.current = spanMs;

  useEffect(() => {
    if (!playing || disabled) return undefined;
    let frame = 0;
    let last = 0;
    const tick = (t: number): void => {
      const step = last === 0 ? 0 : t - last;
      last = t;
      setNowMs((prev) => ((prev ?? 0) + step) % Math.max(1, spanRef.current));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, disabled]);

  const play = useCallback(() => {
    if (disabled) return;
    setNowMs((prev) => prev ?? 0);
    setPlaying(true);
  }, [disabled]);

  const pause = useCallback(() => setPlaying(false), []);

  const scrubTo = useCallback((ms: number) => {
    setPlaying(false);
    setNowMs(Math.max(0, Math.round(ms)));
  }, []);

  const setSpan = useCallback((ms: number) => setSpanMs(Math.max(1, Math.round(ms))), []);

  return { nowMs: disabled ? null : nowMs, playing: playing && !disabled, spanMs, disabled, play, pause, scrubTo, setSpan };
};

export { useMotionPreviewState };
