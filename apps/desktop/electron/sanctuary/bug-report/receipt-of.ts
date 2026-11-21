/* @layer electron-main @kind logic */
import type { BugReportLink, BugReportReceipt } from '@drizztdourden08/brock-core/types';
import type { SubmitReportResult } from '@rotp/hub-contracts';
import { msg } from '@drizztdourden08/brock-core/i18n';
import { mainText } from '../../lib/main-text';
import { reportPageUrl } from '../report-page';
import { ISSUE_LINK_LABEL, SANCTUARY_LINK_LABEL } from './bug-report.constants';

const linksOf = (reportId: string, issueUrl: string): BugReportLink[] => [
  { label: mainText(SANCTUARY_LINK_LABEL), url: reportPageUrl(reportId) },
  ...(issueUrl ? [{ label: mainText(ISSUE_LINK_LABEL), url: issueUrl }] : []),
];

const receiptOf = ({ reportId, issueUrl }: SubmitReportResult, attachError: string | null, retry?: BugReportReceipt['retry']): BugReportReceipt => ({
  message: attachError
    ? mainText(msg('main:sanctuary.report.filedNoDebug', { id: reportId, error: attachError }))
    : mainText(msg('main:sanctuary.report.filed', { id: reportId })),
  url: reportPageUrl(reportId),
  id: reportId,
  links: linksOf(reportId, issueUrl),
  ...(retry ? { retry } : {}),
});

export { receiptOf };
