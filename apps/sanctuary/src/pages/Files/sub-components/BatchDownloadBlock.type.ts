/* @layer sanctuary-site @kind types */
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import type { BatchDownload } from '../behavior/useBatchDownload.type';

type BatchDownloadBlockProps = {
  files: readonly SanctuaryFile[];
  download: BatchDownload;
  busy: boolean;
  onCopyLinks: () => void;
};

export type { BatchDownloadBlockProps };
