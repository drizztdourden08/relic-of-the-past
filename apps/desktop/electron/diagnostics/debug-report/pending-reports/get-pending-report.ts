/* @layer electron-main @kind logic */
import { pendingReportCache } from './pending-report-cache';
import { TTL_MS } from './pending-reports.constants';
import type { PendingReport } from './pending-reports.type';

const getPendingReport = (reportId: string): PendingReport | null => {
  const entry = pendingReportCache.get(reportId);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > TTL_MS) {
    pendingReportCache.delete(reportId);
    return null;
  }
  return entry;
};

export { getPendingReport };
