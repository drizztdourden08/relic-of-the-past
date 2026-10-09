/* @layer renderer-lib @kind logic */
import type { DeviceStickCalibration, StickCalibrationData } from './stick-calibration.type';

const applyOne = (rawX: number, rawY: number, s: StickCalibrationData): { x: number; y: number } => {
  const rnx = s.centerX - s.minX || 1;
  const rpx = s.maxX - s.centerX || 1;
  const rny = s.centerY - s.minY || 1;
  const rpy = s.maxY - s.centerY || 1;

  const nx = rawX < s.centerX
    ? -(s.centerX - rawX) / rnx
    : (rawX - s.centerX) / rpx;
  const ny = rawY < s.centerY
    ? (s.centerY - rawY) / rny
    : -(rawY - s.centerY) / rpy;

  let mag = Math.sqrt(nx * nx + ny * ny);
  let cx = nx, cy = ny;
  if (mag > 1) { cx /= mag; cy /= mag; mag = 1; }

  if (mag < s.innerDeadzone) return { x: 0, y: 0 };

  const rescaled = Math.min(
    (mag - s.innerDeadzone) / (s.outerDeadzone - s.innerDeadzone),
    1,
  );
  const scale = mag > 0 ? rescaled / mag : 0;
  return { x: cx * scale, y: cy * scale };
};

const applySticksCalibration = (lxRaw: number, lyRaw: number, rxRaw: number, ryRaw: number, cal: DeviceStickCalibration): number[] => {
  const l = applyOne(lxRaw, lyRaw, cal.left);
  const r = applyOne(rxRaw, ryRaw, cal.right);
  return [l.x, l.y, r.x, r.y];
};

export { applySticksCalibration };
