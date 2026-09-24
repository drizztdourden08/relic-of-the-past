/* @layer sanctuary-site @kind logic */
/**
 * The Reports scopes over the loaded list: the predicate one tab stands for and a tab
 * per scope with its count as the badge. A report's deadline is the later of expiresAt
 * and extendedUntil; within EXPIRING_SOON_DAYS of now it counts as expiring soon.
 */
import type { TabItem } from '@ds/primitives/TabBar';
import type { ReportView } from '../../../api/types';
import { EXPIRING_SOON_DAYS, REPORT_SCOPES, REPORT_SCOPE_IDS } from '../Reports.constants';

const DAY_MS = 24 * 60 * 60 * 1000;

type ReportPredicate = (report: ReportView) => boolean;

const deadlineOf = (report: ReportView): number | null => {
  const { expiresAt, extendedUntil } = report;
  if (expiresAt === null) return extendedUntil;
  if (extendedUntil === null) return expiresAt;
  return Math.max(expiresAt, extendedUntil);
};

const isExpiringSoon = (report: ReportView, now: number): boolean => {
  const deadline = deadlineOf(report);
  return deadline !== null && deadline - now <= EXPIRING_SOON_DAYS * DAY_MS;
};

const scopePredicate = (scopeId: string, meId: string, now: number): ReportPredicate => {
  switch (scopeId) {
    case REPORT_SCOPE_IDS.player: return (report) => report.kind === 'player';
    case REPORT_SCOPE_IDS.controller: return (report) => report.kind === 'controller';
    case REPORT_SCOPE_IDS.mine: return (report) => report.reporter?.userId === meId;
    case REPORT_SCOPE_IDS.expiring: return (report) => isExpiringSoon(report, now);
    default: return () => true;
  }
};

const reportScopeTabs = (reports: readonly ReportView[], meId: string, now: number): TabItem[] =>
  REPORT_SCOPES.map((scope) => ({
    id: scope.id,
    label: scope.label,
    badge: reports.filter(scopePredicate(scope.id, meId, now)).length,
  }));

export { scopePredicate, reportScopeTabs, deadlineOf, isExpiringSoon };
export type { ReportPredicate };
