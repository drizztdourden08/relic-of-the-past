/* @layer electron-main @kind types */
import type { WriteStream } from 'fs';
import type { DownloadProgress } from './download.type';

type StreamBodyParams = {
  reader: ReadableStreamDefaultReader<Uint8Array>;
  fileStream: WriteStream;
  total?: number;
  onProgress?: DownloadProgress;
};

export type { StreamBodyParams };
