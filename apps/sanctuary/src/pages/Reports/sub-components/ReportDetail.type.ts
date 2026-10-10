/* @layer sanctuary-site @kind types */
import type { ReportView } from '../../../endpoints/api-responses.type';
import type { ReportActions } from '../behavior/useReportActions.type';

type ReportDetailProps = {
  report: ReportView;
  isAdmin: boolean;
  actions: ReportActions;
  onClose: () => void;
};

export type { ReportDetailProps };
