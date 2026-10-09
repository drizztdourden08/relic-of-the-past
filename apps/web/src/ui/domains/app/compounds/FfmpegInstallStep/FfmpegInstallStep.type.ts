/* @layer renderer-components @kind types */
import type { FfmpegState } from '@shared/types/ffmpeg-tool';

interface FfmpegInstallStepProps {
  state: FfmpegState | null;
  installing: boolean;
  onInstall: () => void;
}

export type { FfmpegInstallStepProps };
