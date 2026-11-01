/* @layer renderer-lib @kind types */
import type { LiveVoice } from './scheduler.type';

interface TimedState {
  timer: ReturnType<typeof setTimeout> | null;
  live: LiveVoice[];
  dueAt: number;
  currentWait: number | null;
  lastFileIndex: number | null;
}

export type { TimedState };
