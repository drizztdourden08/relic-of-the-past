/* @layer store-site @kind logic */
import type { DownloadResponse, DownloadBody } from '@rotp/hub-contracts';
import { storeApi } from '../store-client';

const requestDownload = (id: string, body: DownloadBody = {}) =>
  storeApi.request<DownloadResponse>('download', { params: { id }, body });

export { requestDownload };
