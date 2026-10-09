/* @layer shared-types @kind types */
interface FfmpegRelease {
  tag: string;
  asset: string;
}

type FfmpegState =
  | { status: 'missing' }
  | { status: 'downloading'; receivedBytes: number; totalBytes: number }
  | { status: 'verifying' }
  | { status: 'ready'; ffmpegPath: string; ffprobePath: string }
  | { status: 'failed'; reason: string }
  | { status: 'unavailable'; reason: string; installPackage?: string };

export type { FfmpegRelease, FfmpegState };
