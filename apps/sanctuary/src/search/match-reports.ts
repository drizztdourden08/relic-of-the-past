/* @layer sanctuary-site @kind logic */
/**
 * Which reports a global search finds, grouped by kind (player, then controller). A
 * report matches when the (lowercase) query appears in its subject, the reporter's name
 * or GitHub handle, its issue number (with or without the #), its app version, its
 * screen id or its kind. The results draw exactly these reports, so a count is its rows.
 */
import type { ReportKind } from '@shared/sanctuary/report-types';
import type { ReportView } from '../api/types';
import { ANONYMOUS } from '../reports/report-row';
import { REPORT_KINDS } from './search-categories';

type ReportMatchGroup = { kind: ReportKind; reports: ReportView[] };

const searchableText = (report: ReportView): (string | null | undefined)[] => [
  report.subject,
  report.reporter?.displayName ?? ANONYMOUS,
  report.reporter?.githubHandle,
  `#${report.issue.number}`,
  report.appVersion,
  report.screenId,
  report.kind,
];

const reportMatches = (report: ReportView, query: string): boolean =>
  searchableText(report).some((text) => typeof text === 'string' && text.toLowerCase().includes(query));

const matchReports = (reports: readonly ReportView[], query: string): ReportMatchGroup[] =>
  REPORT_KINDS.flatMap((kind) => {
    const hits = reports.filter((report) => report.kind === kind && reportMatches(report, query));
    return hits.length > 0 ? [{ kind, reports: hits }] : [];
  });

export { matchReports, reportMatches };
export type { ReportMatchGroup };
