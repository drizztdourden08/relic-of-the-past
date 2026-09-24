/* @layer sanctuary-site @kind logic */
/** The report routes the site consults: list, download, extend and delete. */
import { request } from './client';
import type { ReportsListResponse, ReportResponse, DownloadResponse } from './types';

/** Every report, one page. Kind, ownership and expiry filters run in the browser. */
const listReports = () => request<ReportsListResponse>('reportsList');

const downloadReport = (id: string) => request<DownloadResponse>('reportsDownload', { params: { id } });

const extendReport = (id: string) => request<ReportResponse>('reportsExtend', { params: { id }, body: {} });

const deleteReport = (id: string) => request<{ ok: true }>('reportsDelete', { params: { id } });

export { listReports, downloadReport, extendReport, deleteReport };
