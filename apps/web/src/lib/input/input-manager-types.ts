/* @layer renderer-lib @kind types */
import type { DetectedDevice, InputProfile } from '@shared/types/controls';
import type { ControllerInputState } from './controller-input-store';

type DeviceChangeListener = (devices: DetectedDevice[]) => void;

/** Fires when the active input profile changes (e.g. via the profile-cycle shortcut). */
type ActiveProfileListener = (profile: InputProfile) => void;

/** Per-frame state listener — for InputCalibration, InputTester visualization */
type InputStateListener = (
  hidStates: Map<string, ControllerInputState>,
  pressedKeys: Set<string>,
) => void;

export type { ActiveProfileListener, DeviceChangeListener, InputStateListener };
