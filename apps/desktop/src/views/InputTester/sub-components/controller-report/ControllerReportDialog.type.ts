/* @layer renderer-components @kind types */
interface ControllerReportDialogProps {
  open: boolean;
  onClose: () => void;
  deviceKey: string;
}

type WizardValues = Record<string, never>;

export type { ControllerReportDialogProps, WizardValues };
