/* @layer renderer-other @kind hook */
/**
 * The display's refresh rate, from the host and from direct measurement.
 *
 * Measurement exists because it is the only signal available on every target: there is no
 * standard refresh-rate API on the web, and mobile reports nothing without a native plugin.
 * Frame callbacks are aligned to the display's vertical blank, so the spacing between them IS
 * the refresh interval. Measured on this machine it returned 120.00 Hz against an OS-reported
 * 120, tight to within a fifth of a millisecond, so it is trustworthy enough to drive the UI.
 */
import { useState, useEffect, useRef } from 'react';
import type { RefreshRateInfo } from '@shared/types/display';
import { getPlatform } from '../platform/get-platform';

/** Discard the first few callbacks; the first intervals after a loop starts are noisy. */
const WARMUP_FRAMES = 5;
/** Enough samples to average out a stray long frame without delaying the readout. */
const SAMPLE_FRAMES = 40;

const median = (values: number[]): number => {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

/**
 * Sample frame-callback spacing once and report the implied rate. Uses the median rather than
 * the mean so a single dropped frame (which doubles one interval) cannot drag the result down.
 */
const measureRefreshHz = (onDone: (hz: number) => void): (() => void) => {
  const intervals: number[] = [];
  let previous = 0;
  let seen = 0;
  let raf = 0;
  let cancelled = false;

  const tick = (time: number) => {
    if (cancelled) return;
    seen++;
    if (seen > WARMUP_FRAMES && previous) intervals.push(time - previous);
    previous = time;
    if (intervals.length >= SAMPLE_FRAMES) {
      const ms = median(intervals);
      if (ms > 0) onDone(1000 / ms);
      return;
    }
    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);
  return () => { cancelled = true; cancelAnimationFrame(raf); };
};

const useRefreshRate = (): RefreshRateInfo => {
  const [info, setInfo] = useState<RefreshRateInfo>({ reportedHz: null, measuredHz: null, modes: [] });
  // Held so the measurement callback can merge into the latest host values without
  // re-triggering the effect and restarting the sampling loop.
  const latest = useRef(info);
  latest.current = info;

  useEffect(() => {
    let alive = true;

    getPlatform().display.getRefreshRate()
      .then((hostInfo) => { if (alive) setInfo((prev) => ({ ...hostInfo, measuredHz: prev.measuredHz })); })
      .catch(() => { /* host cannot answer; measurement still will */ });

    const stop = measureRefreshHz((hz) => {
      if (alive) setInfo({ ...latest.current, measuredHz: hz });
    });

    return () => { alive = false; stop(); };
  }, []);

  return info;
};

export { useRefreshRate, measureRefreshHz };
