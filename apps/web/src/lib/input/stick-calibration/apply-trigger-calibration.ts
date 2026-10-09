/* @layer renderer-lib @kind logic */
import type { TriggerCalibration } from './stick-calibration.type';

const applyTriggerCalibration = (rawValue: number, cal: TriggerCalibration): number => {
  const range = cal.max - cal.base;
  if (range <= 0) return 0;
  const normalized = Math.max(0, Math.min(1, (rawValue - cal.base) / range));
  return normalized < cal.deadzone ? 0 : (normalized - cal.deadzone) / (1 - cal.deadzone);
};

export { applyTriggerCalibration };
