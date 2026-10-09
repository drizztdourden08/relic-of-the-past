/* @layer electron-main @kind types */
import type { ProgressReporter } from './analyze';

interface RunRequest {
  pack: string;
  ffmpegPath: string;
  fileNames: string[];
  report: ProgressReporter;
}

export type { RunRequest };
