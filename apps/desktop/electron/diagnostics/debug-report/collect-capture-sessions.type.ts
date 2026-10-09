/* @layer electron-main @kind types */
interface CaptureSessionFile {
  name: string;
  contents: Buffer;
}

interface FinalizedCaptureSession {
  sessionKey: string;
  files: CaptureSessionFile[];
}

export type { CaptureSessionFile, FinalizedCaptureSession };
