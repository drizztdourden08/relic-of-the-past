/* @layer electron-main @kind logic */
import type { BugReportReceipt } from '@drizztdourden08/brock-core/types';
import { reportPageUrl } from '../report-page';

const receiptOf = (reportId: string, attachError: string | null): BugReportReceipt => ({
  message: attachError ? `Report ${reportId} filed, without its debug files: ${attachError}` : `Report ${reportId} filed`,
  url: reportPageUrl(reportId),
  id: reportId,
});

export { receiptOf };
