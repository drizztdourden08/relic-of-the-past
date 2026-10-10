/* @layer sanctuary-site @kind logic */
import { sanctuaryApi } from '../sanctuary-client';
import type { DownloadResponse } from '../api-responses.type';

const downloadFile = (id: string) => sanctuaryApi.request<DownloadResponse>('filesDownload', { params: { id } });

export { downloadFile };
