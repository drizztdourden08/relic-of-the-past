/* @layer renderer-components @kind types */
import type { ToolState } from '@drizztdourden08/brock-tools/renderer';

interface FfmpegInstallStepProps {
  state: ToolState | null;
  installing: boolean;
  error: string | null;
  onInstall: () => void;
}

export type { FfmpegInstallStepProps };
