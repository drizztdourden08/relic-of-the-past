/* @layer sanctuary-site @kind logic */
/** The report routes the site consults: list, download, extend and delete. */
import { sanctuaryApi } from './sanctuary-client';
import type { ReportsListResponse, ReportResponse, DownloadResponse } from './types';

/** Every report, one page. Kind, ownership and expiry filters run in the browser. */
const listReports = () => sanctuaryApi.request<ReportsListResponse>('reportsList');

const downloadReport = (id: string) => sanctuaryApi.request<DownloadResponse>('reportsDownload', { params: { id } });

const extendReport = (id: string) => sanctuaryApi.request<ReportResponse>('reportsExtend', { params: { id }, body: {} });

const deleteReport = (id: string) => sanctuaryApi.request<{ ok: true }>('reportsDelete', { params: { id } });

export { listReports, downloadReport, extendReport, deleteReport };
