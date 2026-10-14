/* @layer renderer-components @kind constants */
import type { GyroState, IdleState } from '../hid-calibration.type';

const GYRO_DESCRIPTION: Record<GyroState, string> = {
  idle: 'Pick up controller. Start recording, then tilt/rotate/shake.',
  recording: 'Recording... move the controller freely. Stop when done.',
  done: 'Gyro bytes identified and excluded.',
};

const IDLE_DESCRIPTION: Record<IdleState, string> = {
  idle: "Set controller down, don't touch it, then capture.",
  done: 'Baseline captured.',
};

export { GYRO_DESCRIPTION, IDLE_DESCRIPTION };
