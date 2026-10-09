/* @layer sanctuary-site @kind logic */
import type { ReportView } from '../api/api-responses.type';
import { ANONYMOUS } from '../reports/report-row';
import { REPORT_KINDS } from './search-categories';
import type { ReportMatchGroup } from './match-reports.type';

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

export { matchReports };
