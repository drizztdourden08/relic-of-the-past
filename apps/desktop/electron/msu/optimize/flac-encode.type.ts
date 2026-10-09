/* @layer electron-main @kind types */
interface EncodeRequest {
  inputArgs: string[];
  sourcePath: string;
  destPath: string;
  seconds?: number;
  durationSeconds?: number | null;
  onProgress?: (fraction: number) => void;
}

export type { EncodeRequest };
