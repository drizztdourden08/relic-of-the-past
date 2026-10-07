/* @layer renderer-components @kind hook */
/**
 * The editor's own transport (scrub, play, pause) for the stage's motion
 * clock, so an author sees the last heart pulse instead of reasoning about
 * keyframes.
 *
 * IT OVERRIDES A CLOCK, IT DOES NOT ADD ONE. `HudNodeRenderer` already runs
 * `useMotionClock` for any surface holding an animation (§27.7), and the
 * editor's stage is one of those surfaces. So this hook does not sample a
 * curve, does not touch a node and does not know what an animation is: it
 * produces ONE number, `nowMs`, that the stage hands the renderer in place of
 * its own free-running clock. `null` means "don't override", and the stage runs
 * exactly as it does today, which is what an author who never touches the
 * transport must keep getting.
 *
 * CARRIED AS CONTEXT, for `formula-scope.ts`'s own reason: the transport is
 * created by the View (the only tier that may) and read by one control four
 * levels down. Threading it as a prop would widen `NodeInspector`'s surface
 * for something no other section uses, in a file three agents are editing this
 * wave.
 *
 * REDUCED MOTION DISABLES IT, and that is §27.6 read literally instead of
 * worked around. Under `prefers-reduced-motion: reduce` every `animation`
 * entry is silenced at the source (`resolveNodeAnimationStyle`'s first
 * branch), so overriding the clock would move nothing and a play button that
 * visibly does nothing is worse than one that says why it is off. Transitions
 * and enter/exit keep running under reduced motion exactly as they do in game,
 * and neither is driven from here anyway. They react to a value changing, and
 * this transport changes no values.
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

/** One full pass of a 1000 ms animation, which is longer than every duration
 *  in the shipped documents. The scrub is in ms, not in cycles, because
 *  `delay` means two animations on one node are at different points in it. */
const DEFAULT_SPAN_MS = 1000;

interface MotionPreview {
  /** What the stage should feed the renderer, or `null` to let it run free. */
  nowMs: number | null;
  playing: boolean;
  /** The scrub's own right-hand end, in ms. */
  spanMs: number;
  /** True when `prefers-reduced-motion: reduce` has silenced every animation,
   *  so the transport is inert and says so instead of lying. */
  disabled: boolean;
  play: () => void;
  pause: () => void;
  /** Park the clock at `ms`. It pauses first, since scrubbing while playing is
   *  a fight between two things setting the same number. */
  scrubTo: (ms: number) => void;
  setSpan: (ms: number) => void;
}

const MotionPreviewContext = createContext<MotionPreview | null>(null);

/** The transport, or `null` outside a provider. A section rendered in a test
 *  fixture or a measurement harness has no stage to drive. */
const useMotionPreview = (): MotionPreview | null => useContext(MotionPreviewContext);

/**
 * The transport's own state and its `requestAnimationFrame` loop. Called ONCE,
 * by the View. The loop runs only while `playing`, so an editor session that
 * never presses play costs one boolean.
 */
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
      // Wrapped at the span instead of climbing forever: the point of play
      // here is to watch ONE cycle repeat, and a number that grows without
      // bound makes the scrub head's position meaningless.
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

export { DEFAULT_SPAN_MS, MotionPreviewContext, useMotionPreview, useMotionPreviewState };
export type { MotionPreview };
