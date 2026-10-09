/* @layer electron-main @kind types */
import type { ProbedAudio } from '@shared/types/audio-probe';

interface CacheEntry {
  size: number;
  mtimeMs: number;
  probed: ProbedAudio;
}

export type { CacheEntry };
