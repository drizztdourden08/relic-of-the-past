/* @layer electron-main @kind types */
interface EncodeRequest {
  inputArgs: string[];
  sourcePath: string;
  destPath: string;
  seconds?: number;
}

export type { EncodeRequest };
