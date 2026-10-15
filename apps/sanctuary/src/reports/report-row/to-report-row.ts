/* @layer sanctuary-site @kind logic */
import type { ReportView } from '../../endpoints/api-responses.type';
import { formatBytes, formatDateTime } from '@rotp/hub-client';
import { ANONYMOUS } from './report-row.constants';
import { contentsLine } from './contents-line';
import type { ReportRow } from './report-row.type';

const dateOrNull = (ms: number | null) => (ms === null ? null : formatDateTime(ms));

const toReportRow = (report: ReportView): ReportRow => ({
  id: report.id,
  subject: report.subject,
  kind: report.kind,
  reporter: {
    displayName: report.reporter?.displayName ?? ANONYMOUS,
    githubHandle: report.reporter?.githubHandle ?? null,
  },
  issue: report.issue,
  appVersion: report.appVersion,
  platform: report.platform,
  screenId: report.screenId,
  zip: report.zip ? { bytes: report.zip.bytes } : null,
  size: report.zip ? formatBytes(report.zip.bytes) : '-',
  contents: contentsLine(report.zip?.contents),
  createdAt: formatDateTime(report.createdAt),
  expiresAt: dateOrNull(report.expiresAt),
  extendedUntil: dateOrNull(report.extendedUntil),
});

export { toReportRow };
