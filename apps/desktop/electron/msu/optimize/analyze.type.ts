/* @layer electron-main @kind types */
import type { ToolsMain } from '@drizztdourden08/brock-tools/main';
import type { OptimizeProgress } from '@shared/types/msu-optimize';

type ProgressReporter = (progress: OptimizeProgress) => void;

interface AnalyzeRequest {
  pack: string;
  tools: ToolsMain;
  report: ProgressReporter;
}

export type { AnalyzeRequest, ProgressReporter };
