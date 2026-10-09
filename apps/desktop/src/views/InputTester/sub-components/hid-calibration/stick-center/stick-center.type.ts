/* @layer renderer-components @kind types */
import type { StickCandidate } from '../hid-calibration.type';

interface IdleSampler {
  x: StickCandidate;
  y: StickCandidate | null;
  startedAt: number;
  runs: [number[]] | [number[], number[]];
}

interface IdleAxisResult {
  center: number;
  drift: number;
  min: number;
  max: number;
  uniqueCount: number;
  frames: number;
}

interface IdleResult {
  x: StickCandidate & { idle: IdleAxisResult };
  y: (StickCandidate & { idle: IdleAxisResult }) | null;
}

interface IdleFrameOutcome {
  done: IdleResult | null;
  progress: number;
}

export type { IdleAxisResult, IdleFrameOutcome, IdleResult, IdleSampler };
