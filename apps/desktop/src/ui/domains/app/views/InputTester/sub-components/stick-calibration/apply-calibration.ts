/* @layer renderer-components @kind logic */
import type { CalibratedPoint, StickCalibrationData } from './stick-calibration.type';

const applyCalibration = (rawX: number, rawY: number, cal: StickCalibrationData): CalibratedPoint => {
  const rangeNegX = cal.centerX - cal.minX || 1;
  const rangePosX = cal.maxX - cal.centerX || 1;
  const rangeNegY = cal.centerY - cal.minY || 1;
  const rangePosY = cal.maxY - cal.centerY || 1;

  const nx = rawX < cal.centerX
    ? -(cal.centerX - rawX) / rangeNegX
    : (rawX - cal.centerX) / rangePosX;
  const ny = rawY < cal.centerY
    ? (cal.centerY - rawY) / rangeNegY
    : -(rawY - cal.centerY) / rangePosY;

  let mag = Math.sqrt(nx * nx + ny * ny);
  let cx = nx, cy = ny;
  if (mag > 1) { cx /= mag; cy /= mag; mag = 1; }

  if (mag < cal.innerDeadzone) return { x: 0, y: 0 };

  const rescaled = Math.min(
    (mag - cal.innerDeadzone) / (cal.outerDeadzone - cal.innerDeadzone),
    1,
  );
  const scale = mag > 0 ? rescaled / mag : 0;
  return { x: cx * scale, y: cy * scale };
};

export { applyCalibration };
