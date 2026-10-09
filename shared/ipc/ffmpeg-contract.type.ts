/* @layer shared-types @kind types */
import type { ProbedAudio } from '@shared/types/audio-probe';
import type { FfmpegState } from '@shared/types/ffmpeg-tool';

interface FfmpegInvokeContract {
  'ffmpeg:getState': () => Promise<FfmpegState>;
  'ffmpeg:install': () => Promise<FfmpegState>;
  'ffmpeg:probeAudio': (dataPath: string) => Promise<ProbedAudio | null>;
}

export type { FfmpegInvokeContract };
