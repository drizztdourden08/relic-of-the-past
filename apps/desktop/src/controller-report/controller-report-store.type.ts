/* @layer renderer-stores @kind types */
interface ControllerReportState {
  deviceKey: string | null;
  open: (deviceKey: string) => void;
  close: () => void;
}

export type { ControllerReportState };
