/* @layer renderer-lib @kind types */
import type { DetectedDevice, InputProfile } from '../../controls/devices/devices.type';
import type { ControllerInputState } from '../controller-input-store.type';

type DeviceChangeListener = (devices: DetectedDevice[]) => void;

type ActiveProfileListener = (profile: InputProfile) => void;

type InputStateListener = (
  hidStates: Map<string, ControllerInputState>,
  pressedKeys: Set<string>,
) => void;

export type { ActiveProfileListener, DeviceChangeListener, InputStateListener };
