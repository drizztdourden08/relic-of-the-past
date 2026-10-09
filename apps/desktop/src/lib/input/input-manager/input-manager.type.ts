/* @layer renderer-lib @kind types */
import type { DetectedDevice, InputProfile } from '@shared/types/controls/devices/devices.type';
import type { ControllerInputState } from '../controller-input-store';

type DeviceChangeListener = (devices: DetectedDevice[]) => void;

type ActiveProfileListener = (profile: InputProfile) => void;

type InputStateListener = (
  hidStates: Map<string, ControllerInputState>,
  pressedKeys: Set<string>,
) => void;

export type { ActiveProfileListener, DeviceChangeListener, InputStateListener };
