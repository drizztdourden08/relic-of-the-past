/* @layer sanctuary-site @kind logic */
import { sanctuaryApi } from '../sanctuary-client';
import type { ReportsListResponse } from '../api-responses.type';

const listReports = () => sanctuaryApi.request<ReportsListResponse>('reportsList');

export { listReports };
