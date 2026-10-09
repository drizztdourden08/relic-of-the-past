/* @layer sanctuary-site @kind types */
import type { REPORT_SCOPE_IDS } from './Reports.constants';

type Scope = {
  id: string;
  label: string;
};

type ReportScopeId = (typeof REPORT_SCOPE_IDS)[keyof typeof REPORT_SCOPE_IDS];

type ReportsProps = {
  selectedId?: string;
};

export type { Scope, ReportScopeId, ReportsProps };
