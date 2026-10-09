/* @layer shared-types @kind types */
import type { ProbedAudio } from '@rotp/msu';

interface FfmpegInvokeContract {
  'ffmpeg:probeAudio': (dataPath: string) => Promise<ProbedAudio | null>;
}

export type { FfmpegInvokeContract };
