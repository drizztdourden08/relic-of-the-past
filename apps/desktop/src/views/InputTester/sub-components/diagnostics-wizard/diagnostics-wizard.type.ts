/* @layer renderer-components @kind types */
import type { RefObject } from 'react';
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import type { ResolvedDevice } from '@rotp/input-mapping';
import type { HidControllerMap, HidWizardHandle } from '../HidCalibrationWizard';
import type { PositionalCaptureRecord } from './positional-capture/positional-capture.type';
import type { useDiagnosticsWizardState } from './behavior/useDiagnosticsWizardState';

type WizardStep = 'intro' | 'choose-controller' | 'byte-capture' | 'positional-capture' | 'summary';

interface WizardStepInfo {
  step: WizardStep;
  label: string;
}

type HoldTransitionStatus = 'pending' | 'done' | 'error';

type LayoutStage = 'idle' | 'starting' | 'fetching' | 'stopping' | 'done' | 'error';

interface CapturedLayout {
  deviceKey: string;
  entry: DeviceEntry;
  resolved: ResolvedDevice;
}

interface ChooserDevice {
  deviceKey: string;
  vendorId: number;
  productId: number;
  name?: string;
  mapping?: string;
  product: string;
  busType: DeviceEntry['busType'];
  hasByteCapability: boolean;
  sdlId?: number;
  guid?: string;
  hasGyro?: boolean;
  hasRumble?: boolean;
}

interface NameLookupParams {
  deviceKey?: string;
  vendorId?: number;
  productId?: number;
}

interface SummaryPayload {
  createdAt: number;
  byteCapture: HidControllerMap | null;
  positionalCapture: PositionalCaptureRecord[];
}

interface UseWizardNavigationProps {
  hasByteCapability: boolean;
  step: WizardStep;
  setStep: (step: WizardStep) => void;
}

interface UseChooserSelectionParams {
  open: boolean;
  step: WizardStep;
  chooserDevices: readonly ChooserDevice[];
  initialDeviceKey?: string | null;
}

interface UseWizardProfilesParams {
  selectedChooser: ChooserDevice | null;
  liveDeviceEntry: DeviceEntry | null;
  capturedLayout: CapturedLayout | null;
}

interface UseDiagnosticsWizardStateProps {
  open: boolean;
  onComplete?: (map: HidControllerMap) => void;
  initialDeviceKey?: string | null;
}

type DiagnosticsWizardState = ReturnType<typeof useDiagnosticsWizardState>;

interface DiagnosticsFlowBodyProps {
  wizard: DiagnosticsWizardState;
  wizardRef: RefObject<HidWizardHandle | null>;
  onCapturedCountChange: (count: number) => void;
}

export type {
  CapturedLayout, ChooserDevice, DiagnosticsFlowBodyProps, DiagnosticsWizardState,
  HoldTransitionStatus, LayoutStage, NameLookupParams, SummaryPayload,
  UseChooserSelectionParams, UseDiagnosticsWizardStateProps, UseWizardNavigationProps, UseWizardProfilesParams,
  WizardStep, WizardStepInfo,
};
