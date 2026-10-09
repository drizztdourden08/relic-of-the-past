/* @layer renderer-components @kind types */
type ReportStep = 'about' | 'user-info' | 'diagnostics' | 'confirm';

type SubmitStatus = 'idle' | 'submitting' | 'done' | 'error';

interface FiledControllerReport {
  reportId: string;
  issueUrl: string;
  sanctuaryUrl: string;
}

interface DetectionContext {
  detectedName: string;
  sdlMatch: string | null;
  inputApi: string;
  vendorId: string;
  productId: string;
  hidReport: string;
}

interface ReportSectionProps {
  label: string;
  text: string;
}

interface StepIndicatorProps {
  labels: readonly string[];
  current: number;
}

export type {
  DetectionContext, FiledControllerReport, ReportSectionProps, ReportStep,
  StepIndicatorProps, SubmitStatus,
};
