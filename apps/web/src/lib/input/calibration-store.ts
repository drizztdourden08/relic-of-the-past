/* @layer renderer-lib @kind logic */
/**
 * Manages HID device calibration data — stick and trigger profiles.
 */

import type { DeviceStickCalibration, TriggerCalibration } from './stick-calibration';

class CalibrationStore {
  private sticks = new Map<string, DeviceStickCalibration>();
  private triggers = new Map<string, TriggerCalibration>();

  setStick(deviceKey: string, cal: DeviceStickCalibration): void {
    this.sticks.set(deviceKey, cal);
  }

  getStick(deviceKey: string): DeviceStickCalibration | undefined {
    return this.sticks.get(deviceKey);
  }

  loadSticks(store: Record<string, DeviceStickCalibration>): number {
    for (const [key, cal] of Object.entries(store)) {
      this.sticks.set(key, cal);
    }
    return Object.keys(store).length;
  }

  setTrigger(deviceKey: string, axisIndex: number, cal: TriggerCalibration): void {
    this.triggers.set(`${deviceKey}:${axisIndex}`, cal);
  }

  getTrigger(deviceKey: string, axisIndex: number): TriggerCalibration | undefined {
    return this.triggers.get(`${deviceKey}:${axisIndex}`);
  }

  loadTriggers(store: Record<string, { base: number; max: number; deadzone: number }>): number {
    for (const [key, cal] of Object.entries(store)) {
      this.triggers.set(key, cal);
    }
    return Object.keys(store).length;
  }
}

export { CalibrationStore };
