/**
 * Type definitions for the HID Input Reader module.
 */

import type { StickCalibrationData, DeviceStickCalibration } from './stick-calibration';

interface WebHidInputState {
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

/** Raw report emitted for calibration — unprocessed bytes */
interface WebHidRawReport {
  deviceKey: string;
  reportId: number;
  bytes: Uint8Array;
  timestamp: number;
}

type WebHidStateListener = (state: WebHidInputState) => void;
type WebHidRawListener = (report: WebHidRawReport) => void;
type WebHidDiagListener = (msg: string) => void;
/** Fired when a WebHID device physically disconnects. deviceKey = "vid:pid" */
type WebHidDisconnectListener = (deviceKey: string, deviceName: string) => void;

export type {
  DeviceStickCalibration,
  StickCalibrationData,
  WebHidDiagListener,
  WebHidDisconnectListener,
  WebHidInputState,
  WebHidRawListener,
  WebHidRawReport,
  WebHidStateListener,
};
