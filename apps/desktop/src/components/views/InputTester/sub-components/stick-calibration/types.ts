/**
 * Stick calibration types, constants, and helpers.
 */

// ── Types ──

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

type Step = 'center' | 'range' | 'review';

interface StickCalibrationWizardProps {
  onComplete: (cal: DeviceStickCalibration) => void;
  onCancel: () => void;
  existingCalibration?: DeviceStickCalibration | null;
  /** Which stick to calibrate — undefined means both */
  target?: 'left' | 'right';
  /** Filter input state to only this device */
  deviceKey?: string;
}

// ── Constants ──

const CENTER_SAMPLE_FRAMES = 60;
const DEFAULT_INNER_DEADZONE = 0.10;
const DEFAULT_OUTER_DEADZONE = 0.95;

// ── Helpers ──

function applyCalibration(
  rawX: number, rawY: number,
  cal: StickCalibrationData,
): { x: number; y: number } {
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
}

export {
  applyCalibration,
  CENTER_SAMPLE_FRAMES,
  DEFAULT_INNER_DEADZONE,
  DEFAULT_OUTER_DEADZONE,
};
export type {
  DeviceStickCalibration,
  Step,
  StickCalibrationData,
  StickCalibrationData as StickCal,
  StickCalibrationWizardProps,
};
