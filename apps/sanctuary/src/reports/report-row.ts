/* @layer sanctuary-site @kind logic */
/**
 * The row the Reports table shows: an anonymous reporter reads as one, the zip contents
 * as one line, dates as sortable text. The contact email never reaches a row.
 */
import type { ReportContents } from '@shared/sanctuary/report-types';
import type { ReportView } from '../api/types';
import { formatBytes } from '../lib/format-bytes';
import { formatDateTime } from '../lib/format-date';

const ANONYMOUS = 'anonymous';

type ReportRow = Pick<ReportView, 'id' | 'subject' | 'kind' | 'issue' | 'appVersion' | 'platform' | 'screenId' | 'legacy'> & {
  reporter: { displayName: string; githubHandle: string | null };
  zip: { bytes: number } | null;
  size: string;
  contents: string;
  createdAt: string;
  expiresAt: string | null;
  extendedUntil: string | null;
};

const contentsLine = (contents: ReportContents | undefined): string => {
  if (!contents) return 'no attachment';
  const parts = [
    contents.saves ? `${contents.saves} ${contents.saves === 1 ? 'save' : 'saves'}` : null,
    contents.captureSessions ? `${contents.captureSessions} ${contents.captureSessions === 1 ? 'capture' : 'captures'}` : null,
    contents.logs ? 'logs' : null,
  ].filter((part): part is string => part !== null);
  return parts.length ? parts.join(' · ') : 'empty zip';
};

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
  legacy: report.legacy,
  createdAt: formatDateTime(report.createdAt),
  expiresAt: dateOrNull(report.expiresAt),
  extendedUntil: dateOrNull(report.extendedUntil),
});

const reportRowId = (row: ReportRow) => row.id;

export { toReportRow, reportRowId, contentsLine, ANONYMOUS };
export type { ReportRow };
