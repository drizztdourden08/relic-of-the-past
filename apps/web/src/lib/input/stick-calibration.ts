/* @layer renderer-lib @kind logic */
/**
 * Types and math for normalizing raw
 * analog stick and trigger values using user-recorded calibration data.
 */

interface StickCalibrationData {
  centerX: number;
  centerY: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  innerDeadzone: number;
  outerDeadzone: number;
}

interface DeviceStickCalibration {
  left: StickCalibrationData;
  right: StickCalibrationData;
  updatedAt: string;
}

interface TriggerCalibration {
  base: number;
  max: number;
  deadzone: number;
}

const applySticksCalibration = (lxRaw: number, lyRaw: number, rxRaw: number, ryRaw: number, cal: DeviceStickCalibration): number[] => {
  const applyOne = (rawX: number, rawY: number, s: StickCalibrationData) => {
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

  const l = applyOne(lxRaw, lyRaw, cal.left);
  const r = applyOne(rxRaw, ryRaw, cal.right);
  return [l.x, l.y, r.x, r.y];
};

const applyTriggerCalibration = (rawValue: number, cal: TriggerCalibration): number => {
  const range = cal.max - cal.base;
  if (range <= 0) return 0;
  const normalized = Math.max(0, Math.min(1, (rawValue - cal.base) / range));
  return normalized < cal.deadzone ? 0 : (normalized - cal.deadzone) / (1 - cal.deadzone);
};

export { applySticksCalibration, applyTriggerCalibration };
export type { StickCalibrationData, DeviceStickCalibration, TriggerCalibration };
