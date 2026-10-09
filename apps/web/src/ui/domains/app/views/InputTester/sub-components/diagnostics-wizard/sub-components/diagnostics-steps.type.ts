/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { DeviceProfile } from '@shared/input';
import type { DeviceEntry } from '@shared/ipc';
import type { ResolvedDevice } from '@shared/input/family';
import type { HidControllerMap } from '../../HidCalibrationWizard';
import type { PositionalCaptureRecord } from '../positional-capture/positional-capture.type';
import type {
  ChooserDevice, DiagnosticsWizardState, HoldTransitionStatus, LayoutStage, NameLookupParams,
} from '../diagnostics-wizard.type';

interface ByteCaptureStepProps {
  releaseStatus: HoldTransitionStatus;
  deviceKey: string | null;
  initialProfile?: DeviceProfile | null;
  capturedEntry?: DeviceEntry | null;
  initialProfileId?: string;
  initialHasGyro: boolean;
  onCapturedCountChange: (count: number) => void;
  onComplete: (map: HidControllerMap) => void;
  onCancel: () => void;
}

interface ChooseControllerStepProps {
  devices: ChooserDevice[];
  addedNames: (params: NameLookupParams) => string | null;
  selectedDeviceKey: string | null;
  onSelect: (deviceKey: string) => void;
  selectedEntry: ChooserDevice | null;
  mapping: string | null;
  profile: DeviceProfile | null;
}

interface DiagnosticsStepActionsProps {
  wizard: DiagnosticsWizardState;
  cancelAction: ReactNode;
  introBack?: () => void;
  onByteCaptureNext: () => void;
  capturedCount: number;
}

interface HoldStatusLineProps {
  status: HoldTransitionStatus;
  pendingText: string;
  doneText: string;
  errorText: string;
}

interface IntroStepProps {
  releaseStatus: HoldTransitionStatus;
}

interface LayoutCaptureOverlayProps {
  stage: LayoutStage;
  deviceName: string;
}

interface MatchedEntryPanelProps {
  entry: ChooserDevice;
  name: string;
  mapping: string | null;
  profile: DeviceProfile | null;
}

interface PositionalCaptureStepProps {
  restoreStatus: HoldTransitionStatus;
  deviceKey: string | null;
  resolvedDevice: ResolvedDevice | null;
  onRecordsChange: (records: PositionalCaptureRecord[]) => void;
}

interface SummaryStepProps {
  byteCapture: HidControllerMap | null;
  hasByteCapability: boolean;
  positionalRecords: PositionalCaptureRecord[];
}

export type {
  ByteCaptureStepProps, ChooseControllerStepProps, DiagnosticsStepActionsProps,
  HoldStatusLineProps, IntroStepProps, LayoutCaptureOverlayProps, MatchedEntryPanelProps,
  PositionalCaptureStepProps, SummaryStepProps,
};
