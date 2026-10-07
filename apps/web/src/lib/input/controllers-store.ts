/* @layer renderer-lib @kind logic */
/**
 * Renderer input facade: haptics + already-decoded controller state via the
 * platform ControllerHost port, calibration via FileStore. Mirrors the
 * window.api input surface so call sites swap 1:1. Raw HID enumerate/read/
 * write have no desktop implementation any more, because SDL3 claims every
 * controller directly (see controller-devices-store.ts for its device list),
 * so this facade only carries what's still real on every platform.
 */
import type { VibrateStep, VibrateResult } from '@shared/platform';
import * as calibration from '@shared/storage/calibration';
import type { TriggerCal } from '@shared/storage/calibration';
import { getPlatform } from '@app/platform/get-platform';

const ctrl = () => getPlatform().controllers;
const files = () => getPlatform().files;

// Haptics and SDL3 controller state (ControllerHost port).
const vibratePattern = (deviceKey: string, pattern: VibrateStep[], gapMs: number): Promise<VibrateResult> => ctrl().vibratePattern(deviceKey, pattern, gapMs);
const onControllerState = (cb: (deviceKey: string, buttons: boolean[], axes: number[]) => void) => ctrl().onControllerState(cb);

// Calibration (FileStore).
const readStickCalibration = (): Promise<Record<string, unknown>> => calibration.readStick(files());
const writeStickCalibration = (store: Record<string, unknown>): Promise<void> => calibration.writeStick(files(), store);
const readTriggerCalibration = (): Promise<Record<string, TriggerCal>> => calibration.readTrigger(files());
const writeTriggerCalibration = (deviceKey: string, axisIndex: number, cal: TriggerCal): Promise<void> => calibration.writeTrigger(files(), deviceKey, axisIndex, cal);

export {
  vibratePattern, onControllerState,
  readStickCalibration, writeStickCalibration, readTriggerCalibration, writeTriggerCalibration,
};
