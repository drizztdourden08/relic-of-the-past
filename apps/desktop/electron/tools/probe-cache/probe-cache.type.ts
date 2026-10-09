/* @layer electron-main @kind types */
import type { ProbedAudio } from '@rotp/msu';

interface CacheEntry {
  size: number;
  mtimeMs: number;
  probed: ProbedAudio;
}

export type { CacheEntry };
