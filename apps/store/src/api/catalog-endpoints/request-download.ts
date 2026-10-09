/* @layer store-site @kind logic */
import type { DownloadResponse } from '@shared/store/api-types';
import type { DownloadBody } from '@shared/store/schemas';
import { storeApi } from '../store-client';

const requestDownload = (id: string, body: DownloadBody = {}) =>
  storeApi.request<DownloadResponse>('download', { params: { id }, body });

export { requestDownload };
