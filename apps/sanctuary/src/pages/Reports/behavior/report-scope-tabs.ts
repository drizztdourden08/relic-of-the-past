/* @layer sanctuary-site @kind logic */
import type { TabItem } from '@drizztdourden08/tessera/primitives';
import type { ReportView } from '../../../endpoints/api-responses.type';
import { REPORT_SCOPES } from '../Reports.constants';
import { scopePredicate } from './scope-predicate';

const reportScopeTabs = (reports: readonly ReportView[], meId: string, now: number): TabItem[] =>
  REPORT_SCOPES.map((scope) => ({
    id: scope.id,
    label: scope.label,
    badge: reports.filter(scopePredicate(scope.id, meId, now)).length,
  }));

export { reportScopeTabs };
