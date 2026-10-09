/* @layer renderer-hooks @kind logic */
import { useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULT_FPS, MAX_FPS, MIN_FPS } from './useAnimationClock.constants';

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

export { useAnimationClock };
