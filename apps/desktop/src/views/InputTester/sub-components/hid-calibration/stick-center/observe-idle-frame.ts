/* @layer renderer-components @kind logic */
import { IDLE_SAMPLE_MS } from './stick-center.constants';
import type { IdleAxisResult, IdleFrameOutcome, IdleSampler } from './stick-center.type';

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted[Math.floor(sorted.length / 2)];
  if (middle === undefined) throw new Error('median of an empty idle run');
  return middle;
};

const summarise = (values: number[]): IdleAxisResult => {
  const center = median(values);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return {
    center,
    drift: Math.max(max - center, center - min),
    min,
    max,
    uniqueCount: new Set(values).size,
    frames: values.length,
  };
};

const observeIdleFrame = (sampler: IdleSampler, bytes: Uint8Array, now: number): IdleFrameOutcome => {
  const [xRun, yRun] = sampler.runs;
  xRun.push(bytes[sampler.x.idx] ?? 0);
  if (sampler.y && yRun) yRun.push(bytes[sampler.y.idx] ?? 0);

  const progress = Math.min(1, (now - sampler.startedAt) / IDLE_SAMPLE_MS);
  if (progress < 1 || sampler.runs.some((run) => run.length === 0)) return { done: null, progress };

  const xIdle = summarise(xRun);
  const yIdle = sampler.y && yRun ? summarise(yRun) : null;
  return {
    done: {
      x: { ...sampler.x, center: xIdle.center, idle: xIdle },
      y: sampler.y && yIdle ? { ...sampler.y, center: yIdle.center, idle: yIdle } : null,
    },
    progress: 1,
  };
};

export { observeIdleFrame };
