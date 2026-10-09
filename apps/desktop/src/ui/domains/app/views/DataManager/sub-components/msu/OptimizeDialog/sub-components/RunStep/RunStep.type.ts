/* @layer renderer-components @kind types */
import type { OptimizeProgress, OptimizeRunResult } from '@shared/types/msu-optimize';

interface RunStepProps {
  progress: OptimizeProgress | null;
  result: OptimizeRunResult | null;
}

export type { RunStepProps };
