/* @layer renderer-components @kind logic */
import { IDLE_SAMPLE_MS } from './stick-center.constants';
import type { IdleAxisResult, IdleFrameOutcome, IdleSampler } from './stick-center.type';

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
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
  const indices = sampler.y ? [sampler.x.idx, sampler.y.idx] : [sampler.x.idx];
  indices.forEach((byteIndex, slot) => sampler.runs[slot].push(bytes[byteIndex] ?? 0));

  const progress = Math.min(1, (now - sampler.startedAt) / IDLE_SAMPLE_MS);
  if (progress < 1 || sampler.runs.some((run) => run.length === 0)) return { done: null, progress };

  const xIdle = summarise(sampler.runs[0]);
  const yIdle = sampler.y ? summarise(sampler.runs[1]) : null;
  return {
    done: {
      x: { ...sampler.x, center: xIdle.center, idle: xIdle },
      y: sampler.y && yIdle ? { ...sampler.y, center: yIdle.center, idle: yIdle } : null,
    },
    progress: 1,
  };
};

export { observeIdleFrame };
