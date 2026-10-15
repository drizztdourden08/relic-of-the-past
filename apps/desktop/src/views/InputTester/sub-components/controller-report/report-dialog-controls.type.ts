/* @layer renderer-components @kind types */
import type { UseControllerReportForm } from './controller-report-form.type';
import type { useReportDialogControls } from './behavior/useReportDialogControls';

type ReportDialogControls = ReturnType<typeof useReportDialogControls>;

interface UseReportDialogControlsParams {
  form: UseControllerReportForm;
  onClose: () => void;
}

interface ReportDialogPartProps {
  form: UseControllerReportForm;
  controls: ReportDialogControls;
}

export type { ReportDialogPartProps, UseReportDialogControlsParams };
