/* @layer electron-main @kind types */
import type { ToolsMain } from '@drizztdourden08/brock-tools/main';
import type { ProgressReporter } from './analyze';

interface RunRequest {
  pack: string;
  tools: ToolsMain;
  fileNames: string[];
  report: ProgressReporter;
}

export type { RunRequest };
