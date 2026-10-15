/* @layer shared-store @kind types */
type LocalHeader = {
  name: string;
  method: number;
  compressedSize: number;
  uncompressedSize: number;
  dataStart: number;
};

type HeaderFailure = 'not-zip' | 'truncated' | 'encrypted' | 'streamed';

type HeaderResult =
  | { ok: true; header: LocalHeader }
  | { ok: false; reason: HeaderFailure; needBytes?: number };

export type { HeaderFailure, HeaderResult };
