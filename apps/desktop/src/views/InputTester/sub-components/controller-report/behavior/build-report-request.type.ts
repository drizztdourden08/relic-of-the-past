/* @layer renderer-components @kind types */
import type { HubMe } from '@app/ipc';
import type { ReportContext } from '@rotp/hub-contracts';
import type { HidControllerMap } from '@drizztdourden08/brock-input/renderer';
import type { GamepadDiagnosticsReport } from '@drizztdourden08/brock-input/renderer';
import type { PositionalCaptureRecord } from '@drizztdourden08/brock-input/renderer';
import type { DetectionContext } from '@drizztdourden08/brock-input/renderer';

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
