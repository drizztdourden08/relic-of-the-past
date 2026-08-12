/* @layer renderer-lib @kind logic */
/**
 * Type definitions for the controller input store module.
 */

import type { StickCalibrationData, DeviceStickCalibration } from './stick-calibration';

interface ControllerInputState {
  deviceKey: string;
  buttons: boolean[];
  axes: number[];
  timestamp: number;
  /** Raw 12-bit stick values [lx, ly, rx, ry] before calibration (for calibration UI) */
  rawSticks?: [number, number, number, number];
  /** Raw HID report bytes (for debug UI) */
  rawBytes?: Uint8Array;
  /** HID report ID */
  reportId?: number;
}

/** Raw HID report emitted for calibration — unprocessed bytes */
interface HidRawReportEvent {
  deviceKey: string;
  reportId: number;
  bytes: Uint8Array;
  timestamp: number;
}

type ControllerStateListener = (state: ControllerInputState) => void;
type HidRawReportListener = (report: HidRawReportEvent) => void;
type ControllerDiagListener = (msg: string) => void;
/** Fired when a controller physically disconnects. deviceKey = "vid:pid" */
type ControllerDisconnectListener = (deviceKey: string, deviceName: string) => void;

export type {
  ControllerDiagListener,
  ControllerDisconnectListener,
  ControllerInputState,
  ControllerStateListener,
  DeviceStickCalibration,
  HidRawReportEvent,
  HidRawReportListener,
  StickCalibrationData,
};
