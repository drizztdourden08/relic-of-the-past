/* @layer renderer-components @kind types */
import type { FfmpegState } from '@shared/types/ffmpeg-tool';

interface FfmpegInstallStepProps {
  /** Null while the tool's state is still being read. */
  state: FfmpegState | null;
  installing: boolean;
  onInstall: () => void;
}

export type { FfmpegInstallStepProps };
