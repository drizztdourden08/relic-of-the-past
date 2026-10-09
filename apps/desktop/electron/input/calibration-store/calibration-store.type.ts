/* @layer electron-main @kind types */
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

type StickCalibrationStore = Record<string, DeviceStickCalibration>;

type TriggerCalibration = { base: number; max: number; deadzone: number };
type TriggerCalibrationStore = Record<string, TriggerCalibration>;

export type { DeviceStickCalibration, StickCalibrationData, StickCalibrationStore, TriggerCalibration, TriggerCalibrationStore };
