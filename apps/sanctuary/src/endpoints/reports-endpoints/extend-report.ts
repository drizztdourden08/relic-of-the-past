/* @layer sanctuary-site @kind logic */
import { sanctuaryApi } from '../sanctuary-client';
import type { ReportResponse } from '../api-responses.type';

const extendReport = (id: string) => sanctuaryApi.request<ReportResponse>('reportsExtend', { params: { id }, body: {} });

export { extendReport };
