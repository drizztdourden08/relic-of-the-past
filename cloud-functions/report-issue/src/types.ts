interface ControllerReportPayload {
  detectedName: string;
  sdlMatch: string | null;
  inputApi: string;
  vendorId: string;
  productId: string;
  hidReport: string;
  calibrationMap: string;
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
