/* @layer renderer-hooks @kind logic */
/**
 * One frame ticker for the whole studio.
 *
 * The contact sheet animates every state at once, so a clock per canvas would mean dozens
 * of independent timers drifting apart. A single counter shared by every canvas keeps them
 * in step and costs one animation frame regardless of how many poses are on screen; each
 * canvas takes the tick modulo its own frame count.
 */
import { useState, useEffect, useRef, useCallback } from 'react';

const DEFAULT_FPS = 8;
const MIN_FPS = 1;
const MAX_FPS = 30;

const useAnimationClock = (initialFps: number = DEFAULT_FPS) => {
  const [tick, setTick] = useState(0);
  const [fps, setFps] = useState(initialFps);
  const [playing, setPlaying] = useState(true);
  const last = useRef(0);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const step = (now: number) => {
      const interval = 1000 / fps;
      if (now - last.current >= interval) {
        last.current = now;
        setTick((t) => t + 1);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, fps]);

  const stepOnce = useCallback(() => {
    setPlaying(false);
    setTick((t) => t + 1);
  }, []);

  const clampFps = useCallback((next: number) => setFps(Math.min(MAX_FPS, Math.max(MIN_FPS, next))), []);

  return { tick, fps, setFps: clampFps, playing, setPlaying, stepOnce, MIN_FPS, MAX_FPS };
};

export { useAnimationClock, DEFAULT_FPS };
