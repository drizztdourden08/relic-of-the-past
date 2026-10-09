/* @layer sanctuary-site @kind types */
import type { useBatchDownload } from './useBatchDownload';

type DownloadStatus = {
  running: boolean;
  percent: number;
  label: string | null;
  failed: boolean;
  pickKey: string;
};

type BatchDownload = ReturnType<typeof useBatchDownload>;

export type { BatchDownload, DownloadStatus };
