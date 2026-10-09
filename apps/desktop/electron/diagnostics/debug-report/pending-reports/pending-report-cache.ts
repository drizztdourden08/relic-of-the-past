/* @layer electron-main @kind logic */
import type { PendingReport } from './pending-reports.type';

const pendingReportCache = new Map<string, PendingReport>();

export { pendingReportCache };
