/* @layer electron-main @kind types */
import type { ToolsMain } from '@drizztdourden08/brock-tools/main';

interface MeasureRequest {
  tools: ToolsMain;
  tempDir: string;
  filePath: string;
  fileName: string;
  sizeBytes: number;
  index: number;
}

export type { MeasureRequest };
