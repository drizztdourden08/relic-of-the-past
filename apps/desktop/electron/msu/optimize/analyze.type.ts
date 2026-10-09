/* @layer electron-main @kind types */
import type { OptimizeProgress } from '@shared/types/msu-optimize';

type ProgressReporter = (progress: OptimizeProgress) => void;

interface AnalyzeRequest {
  pack: string;
  ffmpegPath: string;
  report: ProgressReporter;
}

export type { AnalyzeRequest, ProgressReporter };
