/* @layer electron-main @kind logic */
import { pendingReportCache } from './pending-report-cache';

const storePendingReport = (reportId: string, zip: Buffer, profileId: string, sessionKeys: string[]): void => {
  pendingReportCache.set(reportId, { zip, profileId, sessionKeys, createdAt: Date.now() });
};

export { storePendingReport };
