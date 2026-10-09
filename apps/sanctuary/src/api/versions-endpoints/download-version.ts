/* @layer sanctuary-site @kind logic */
import { sanctuaryApi } from '../sanctuary-client';
import type { DownloadResponse } from '../api-responses.type';

const downloadVersion = (id: string, n: number) =>
  sanctuaryApi.request<DownloadResponse>('fileVersionsDownload', { params: { id, n }, body: {} });

export { downloadVersion };
