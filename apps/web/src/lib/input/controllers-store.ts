/* @layer renderer-lib @kind logic */
/**
 * Renderer input facade: native HID device I/O via the platform ControllerHost
 * port, calibration via FileStore. Mirrors the window.api input surface so call
 * sites swap 1:1. On Electron this is the proven node-hid path; on web/Capacitor
 * the device I/O no-ops (Gamepad API / touch are wired in a later pass).
 */
import type { VibrateStep, VibrateResult, HidDeviceInfo } from '@shared/platform';
import * as calibration from '@shared/storage/calibration';
import type { TriggerCal } from '@shared/storage/calibration';
import { getPlatform } from '@app/platform/get-platform';

const ctrl = () => getPlatform().controllers;
const files = () => getPlatform().files;

// ── Native HID device I/O (ControllerHost port) ──
const enumerateHidDevices = (): Promise<HidDeviceInfo[]> => ctrl().enumerate();
const getOpenHidKeys = (): Promise<string[]> => ctrl().getOpenKeys();
const writeHidDevice = (deviceKey: string, data: number[]): Promise<boolean> => ctrl().write(deviceKey, data);
const vibratePattern = (deviceKey: string, pattern: VibrateStep[], gapMs: number): Promise<VibrateResult> => ctrl().vibratePattern(deviceKey, pattern, gapMs);
const onHidReport = (cb: (deviceKey: string, vendorId: number, productId: number, data: Buffer) => void) => ctrl().onReport(cb);
const onHidDeviceOpened = (cb: (info: { deviceKey: string; vendorId: string; productId: string; product: string }) => void) => ctrl().onDeviceOpened(cb);
const onHidDisconnect = (cb: (info: { deviceKey: string; product: string; error?: string }) => void) => ctrl().onDisconnect(cb);
const onHidError = (cb: (info: { deviceKey: string; error: string }) => void) => ctrl().onError(cb);
const onHidMainPerf = (cb: (msg: string) => void) => ctrl().onMainPerf(cb);

// ── Calibration (FileStore) ──
const readStickCalibration = (): Promise<Record<string, unknown>> => calibration.readStick(files());
const writeStickCalibration = (store: Record<string, unknown>): Promise<void> => calibration.writeStick(files(), store);
const readTriggerCalibration = (): Promise<Record<string, TriggerCal>> => calibration.readTrigger(files());
const writeTriggerCalibration = (deviceKey: string, axisIndex: number, cal: TriggerCal): Promise<void> => calibration.writeTrigger(files(), deviceKey, axisIndex, cal);

export {
  enumerateHidDevices, getOpenHidKeys, writeHidDevice, vibratePattern,
  onHidReport, onHidDeviceOpened, onHidDisconnect, onHidError, onHidMainPerf,
  readStickCalibration, writeStickCalibration, readTriggerCalibration, writeTriggerCalibration,
};
