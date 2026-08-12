/* @layer shared-types @kind types */
interface ControllerReportPayload {
  /** Best display name we resolved for the device — hand-coded preset, SDL name, or "Unrecognized controller". */
  detectedName: string;
  /** Name of the closest SDL_GameControllerDB entry for this VID:PID, or null if none exists. */
  sdlMatch: string | null;
  /** Resolved input path: 'hid' | 'webapi', or 'unknown' if nothing matched. */
  inputApi: string;
  vendorId: string;
  productId: string;
  /** Raw HID device identity + recent raw report log, preformatted text. */
  hidReport: string;
  /** The HidControllerMap JSON produced by the wizard step, preformatted text. */
  calibrationMap: string;
  /** One record per control asked for during positional capture: the label the
   *  user was shown against the position SDL actually reported. Preformatted
   *  JSON, absent when that step was skipped. */
  positionalCapture?: string;
  /** Device identity and capability report as SDL saw it, preformatted JSON. */
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
