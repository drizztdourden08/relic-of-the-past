/* @layer renderer-lib @kind logic */
import type { VibrationSegment } from '@shared/input/vibration-segment.type';
import { applyVibrationShaping } from '@shared/input/family';
import { recallControllerSdlType } from '../controller-family-cache';

const shapeForDevice = (deviceKey: string, pattern: VibrationSegment[], minDurationExempt?: boolean): VibrationSegment[] => {
  const [vidHex, pidHex] = deviceKey.split(':');
  const sdlType = recallControllerSdlType(parseInt(vidHex, 16), parseInt(pidHex, 16));
  if (!sdlType) return pattern;
  return applyVibrationShaping({ sdlType, deviceKey, pattern, minDurationExempt });
};

export { shapeForDevice };
