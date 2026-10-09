/* @layer renderer-lib @kind types */
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

export type { StickCalibrationData, DeviceStickCalibration, TriggerCalibration };
