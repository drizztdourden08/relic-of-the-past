/* @layer renderer-components @kind types */
import type { OptimizeProgress, OptimizeRunResult } from '@rotp/msu';

interface RunStepProps {
  progress: OptimizeProgress | null;
  result: OptimizeRunResult | null;
}

export type { RunStepProps };
