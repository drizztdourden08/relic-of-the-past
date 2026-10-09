/* @layer sanctuary-site @kind constants */
import type { DownloadStatus } from './useBatchDownload.type';

const IDLE: DownloadStatus = { running: false, percent: 0, label: null, failed: false, pickKey: '' };

export { IDLE };
