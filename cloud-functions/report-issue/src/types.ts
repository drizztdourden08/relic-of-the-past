/* @layer root-config @kind types */
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

interface CreateIssueRequest {
  email: string;
  title: string;
  message: string;
  debugInfo: string;
  controllerReport?: ControllerReportPayload;
}

interface CreateIssueResult {
  url: string;
}

export type { ControllerReportPayload, CreateIssueRequest, CreateIssueResult };
