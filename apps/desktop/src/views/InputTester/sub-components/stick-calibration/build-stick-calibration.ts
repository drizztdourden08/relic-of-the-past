/* @layer renderer-components @kind logic */
import type { DeviceStickCalibration } from '@drizztdourden08/brock-input';
import { DEFAULT_STICK } from './stick-calibration.constants';
import type { StickCalibration, StickBuildInput } from './stick-calibration.type';

const buildStickCalibration = (input: StickBuildInput): DeviceStickCalibration => {
  const { calibrateLeft, calibrateRight, centerValues: c, rangeMinMax: mm, innerDz, outerDz, existingCalibration } = input;
  const left: StickCalibration = calibrateLeft ? {
    centerX: c.lx, centerY: c.ly, minX: mm.lxMin, maxX: mm.lxMax, minY: mm.lyMin, maxY: mm.lyMax,
    innerDeadzone: innerDz, outerDeadzone: outerDz,
  } : (existingCalibration?.left ?? DEFAULT_STICK);
  const right: StickCalibration = calibrateRight ? {
    centerX: c.rx, centerY: c.ry, minX: mm.rxMin, maxX: mm.rxMax, minY: mm.ryMin, maxY: mm.ryMax,
    innerDeadzone: innerDz, outerDeadzone: outerDz,
  } : (existingCalibration?.right ?? DEFAULT_STICK);
  return { left, right, updatedAt: new Date().toISOString() };
};

export { buildStickCalibration };
