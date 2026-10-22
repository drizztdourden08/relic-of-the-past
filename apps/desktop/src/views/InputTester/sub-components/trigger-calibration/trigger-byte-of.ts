/* @layer renderer-components @kind logic */
import { LEFT_TRIGGER_AXIS, LEFT_TRIGGER_BYTE, RIGHT_TRIGGER_AXIS, RIGHT_TRIGGER_BYTE } from './trigger-calibration.constants';

const offsetFor = (axisIndex: number): number | null => {
  if (axisIndex === LEFT_TRIGGER_AXIS) return LEFT_TRIGGER_BYTE;
  if (axisIndex === RIGHT_TRIGGER_AXIS) return RIGHT_TRIGGER_BYTE;
  return null;
};

const triggerByteOf = (rawBytes: Uint8Array | undefined, axisIndex: number): number | null => {
  const offset = offsetFor(axisIndex);
  if (!rawBytes || offset === null || rawBytes.length <= offset) return null;
  return rawBytes[offset] ?? null;
};

export { triggerByteOf };
