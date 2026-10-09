/* @layer electron-main @kind types */
import type { FfmpegState } from '@shared/types/ffmpeg-tool';

type StateReporter = (state: FfmpegState) => void;

export type { StateReporter };
