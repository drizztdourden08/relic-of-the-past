/* @layer electron-main @kind types */
interface MeasureRequest {
  ffmpegPath: string;
  tempDir: string;
  filePath: string;
  fileName: string;
  sizeBytes: number;
  index: number;
}

export type { MeasureRequest };
