/* @layer renderer-components @kind types */
import type { OptimizeProgress, OptimizeRunResult } from '@shared/types/msu-optimize';

interface RunStepProps {
  /** Null until the first file reports in. */
  progress: OptimizeProgress | null;
  /** Null while the run is still going; set once it has finished. */
  result: OptimizeRunResult | null;
}

export type { RunStepProps };
