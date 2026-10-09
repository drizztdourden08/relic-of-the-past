/* @layer shared-types @kind types */
import type { ProbedAudio } from '@shared/types/audio-probe';

interface FfmpegInvokeContract {
  'ffmpeg:probeAudio': (dataPath: string) => Promise<ProbedAudio | null>;
}

export type { FfmpegInvokeContract };
