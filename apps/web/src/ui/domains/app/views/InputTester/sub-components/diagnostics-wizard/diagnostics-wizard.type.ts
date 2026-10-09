/* @layer renderer-components @kind types */
import type { RefObject } from 'react';
import type { DeviceEntry } from '@shared/ipc';
import type { ResolvedDevice } from '@shared/input/family';
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
  UseDiagnosticsWizardStateProps, UseWizardNavigationProps, WizardStep, WizardStepInfo,
};
