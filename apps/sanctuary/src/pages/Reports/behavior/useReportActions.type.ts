/* @layer sanctuary-site @kind types */
import type { ReportView } from '../../../api/api-responses.type';
import type { useReportActions } from './useReportActions';

type UseReportActionsParams = {
  onExtended: (report: ReportView) => void;
  onDeleted: (id: string) => void;
};

type ReportActions = ReturnType<typeof useReportActions>;

export type { ReportActions, UseReportActionsParams };
