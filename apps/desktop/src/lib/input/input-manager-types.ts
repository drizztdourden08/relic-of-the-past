/* @layer renderer-lib @kind types */
import type { DetectedDevice } from '@shared/types/controls';
import type { WebHidInputState } from './hid-reader';
import type { GamepadSnapshot } from './polling-engine';

type DeviceChangeListener = (devices: DetectedDevice[]) => void;

/** Per-frame state listener — for InputCalibration, InputTester visualization */
type InputStateListener = (
  hidStates: Map<string, WebHidInputState>,
  gamepads: GamepadSnapshot[],
  pressedKeys: Set<string>,
) => void;

export type { DeviceChangeListener, InputStateListener };
