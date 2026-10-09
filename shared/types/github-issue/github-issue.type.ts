/* @layer shared-types @kind types */
interface ControllerReportPayload {
  detectedName: string;
  sdlMatch: string | null;
  inputApi: string;
  vendorId: string;
  productId: string;
  hidReport: string;
  calibrationMap: string;
  positionalCapture?: string;
  diagnosticsReport?: string;
}

export type { ControllerReportPayload };
