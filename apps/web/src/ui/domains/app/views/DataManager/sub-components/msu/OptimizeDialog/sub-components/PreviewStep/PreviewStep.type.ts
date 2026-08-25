/* @layer renderer-components @kind types */
import type { OptimizeAnalysis } from '@shared/types/msu-optimize';

interface PreviewStepProps {
  analysis: OptimizeAnalysis;
  /** How many rows a run would really convert — the excluded ones are not among them. */
  convertibleCount: number;
}

export type { PreviewStepProps };
