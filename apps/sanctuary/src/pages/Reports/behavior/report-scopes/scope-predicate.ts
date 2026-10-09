/* @layer sanctuary-site @kind logic */
import type { ReportView } from '../../../../api/api-responses.type';
import { EXPIRING_SOON_DAYS, REPORT_SCOPE_IDS } from '../../Reports.constants';
import { DAY_MS } from './report-scopes.constants';
import { deadlineOf } from './deadline-of';
import type { ReportPredicate } from './report-scopes.type';

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

export { scopePredicate };
