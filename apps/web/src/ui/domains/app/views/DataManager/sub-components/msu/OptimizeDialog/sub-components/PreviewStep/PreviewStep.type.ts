/* @layer renderer-components @kind types */
import type { OptimizeAnalysis } from '@shared/types/msu-optimize';

interface PreviewStepProps {
  analysis: OptimizeAnalysis;
  /** How many rows a run would really convert. Excluded rows are not counted. */
  convertibleCount: number;
}

export type { PreviewStepProps };
