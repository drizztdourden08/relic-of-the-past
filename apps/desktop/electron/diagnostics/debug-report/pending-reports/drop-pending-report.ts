/* @layer electron-main @kind logic */
import { pendingReportCache } from './pending-report-cache';

const dropPendingReport = (reportId: string): void => {
  pendingReportCache.delete(reportId);
};

export { dropPendingReport };
