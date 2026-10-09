/* @layer sanctuary-site @kind logic */
import { sanctuaryApi } from '../sanctuary-client';
import type { DownloadResponse } from '../api-responses.type';

const downloadReport = (id: string) => sanctuaryApi.request<DownloadResponse>('reportsDownload', { params: { id } });

export { downloadReport };
