/* @layer electron-main @kind logic */
import type { BugReportLink, BugReportReceipt } from '@drizztdourden08/brock-core/types';
import type { SubmitReportResult } from '@rotp/hub-contracts';
import { reportPageUrl } from '../report-page';
import { ISSUE_LINK_LABEL, SANCTUARY_LINK_LABEL } from './bug-report.constants';

const linksOf = (reportId: string, issueUrl: string): BugReportLink[] => [
  { label: SANCTUARY_LINK_LABEL, url: reportPageUrl(reportId) },
  ...(issueUrl ? [{ label: ISSUE_LINK_LABEL, url: issueUrl }] : []),
];

const receiptOf = ({ reportId, issueUrl }: SubmitReportResult, attachError: string | null, retry?: BugReportReceipt['retry']): BugReportReceipt => ({
  message: attachError ? `Report ${reportId} filed, without its debug files: ${attachError}` : `Report ${reportId} filed`,
  url: reportPageUrl(reportId),
  id: reportId,
  links: linksOf(reportId, issueUrl),
  ...(retry ? { retry } : {}),
});

export { receiptOf };
