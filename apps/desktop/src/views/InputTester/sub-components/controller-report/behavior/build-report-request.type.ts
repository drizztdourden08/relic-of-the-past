/* @layer renderer-components @kind types */
import type { HubMe } from '@app/ipc';
import type { ReportContext } from '@rotp/hub-contracts';
import type { HidControllerMap } from '../../HidCalibrationWizard';
import type { GamepadDiagnosticsReport } from '../../hid-calibration/diagnostics';
import type { PositionalCaptureRecord } from '../../diagnostics-wizard/positional-capture/positional-capture.type';
import type { DetectionContext } from '../controller-report.type';

interface ReportRequestParams {
  subjectPrefix: string;
  context: ReportContext;
  me: HubMe | null;
  name: string;
  email: string;
  additionalInfo: string;
  detection: DetectionContext;
  debugText: string;
  calibrationMap: HidControllerMap;
  positionalRecords: readonly PositionalCaptureRecord[];
  diagnosticsReport: GamepadDiagnosticsReport | null;
}

export type { ReportRequestParams };
