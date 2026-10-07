/* @layer renderer-lib @kind logic */
/**
 * Button/axis state and diagnostics for every
 * connected pad. Input decoding itself is owned entirely by the SDL3 native
 * transport (see handleControllerState); this module holds the resulting
 * state, calibration, and the diagnostic log the InputTester UI reads.
 */

import { CalibrationStore } from './calibration-store';
import { processControllerState } from './process-controller-state';
import type { DeviceStickCalibration, TriggerCalibration } from './stick-calibration';
import type { ControllerRawReport } from '@shared/ipc';
import type {
  ControllerDiagListener,
  ControllerDisconnectListener,
  ControllerInputState,
  ControllerStateListener,
  HidRawReportEvent,
  HidRawReportListener,
} from './controller-input-store-types';

const toHex4 = (n: number): string => n.toString(16).padStart(4, '0');

class ControllerInputStore {
  states = new Map<string, ControllerInputState>();
  listeners = new Set<ControllerStateListener>();
  rawListeners = new Set<HidRawReportListener>();
  diagListeners = new Set<ControllerDiagListener>();
  connectedDeviceKeys = new Set<string>();
  connected = false;
  rawReportLog: string[] = [];
  readonly rawLogMax = 100;

  private diagLog: string[] = [];
  private disconnectListeners = new Set<ControllerDisconnectListener>();
  private calibrations = new CalibrationStore();

  setStickCalibration(deviceKey: string, cal: DeviceStickCalibration): void {
    this.calibrations.setStick(deviceKey, cal);
    this.log(`Stick calibration loaded for ${deviceKey}`);
  }
  getStickCalibration(deviceKey: string): DeviceStickCalibration | undefined {
    return this.calibrations.getStick(deviceKey);
  }
  loadStickCalibrations(store: Record<string, DeviceStickCalibration>): void {
    const n = this.calibrations.loadSticks(store);
    if (n > 0) this.log(`Loaded saved stick calibrations (${n} profile(s))`);
  }
  setTriggerCalibration(deviceKey: string, axisIndex: number, cal: TriggerCalibration): void {
    this.calibrations.setTrigger(deviceKey, axisIndex, cal);
    this.log(`Trigger calibration loaded for ${deviceKey} axis ${axisIndex}`);
  }
  getTriggerCalibration(deviceKey: string, axisIndex: number): TriggerCalibration | undefined {
    return this.calibrations.getTrigger(deviceKey, axisIndex);
  }
  loadTriggerCalibrations(store: Record<string, { base: number; max: number; deadzone: number }>): void {
    const n = this.calibrations.loadTriggers(store);
    if (n > 0) this.log(`Loaded saved trigger calibrations (${n} entry(s))`);
  }

  log(msg: string): void {
    const entry = `[${new Date().toLocaleTimeString()}] ${msg}`;
    this.diagLog.push(entry);
    if (this.diagLog.length > 100) this.diagLog.shift();
    for (const cb of this.diagListeners) cb(entry);
  }
  pushRawLog(entry: string): void {
    this.rawReportLog.push(entry);
    if (this.rawReportLog.length > this.rawLogMax) this.rawReportLog.shift();
  }
  getDiagLog(): string[] { return [...this.diagLog]; }
  addDiag(msg: string): void { this.log(msg); }
  getStates(): Map<string, ControllerInputState> { return this.states; }
  isConnected(): boolean { return this.connected; }
  getRawReportLog(): string[] { return [...this.rawReportLog]; }
  /** Devices that have sent at least one input report this session. NOT the same as
   *  "connected". SDL emits state on change only, so an untouched-but-connected pad
   *  never appears here. For actual connection state, use the device snapshot
   *  (InputManager.hidDeviceCache, status 'ready') instead. */
  getDevicesThatHaveReported(): string[] { return [...this.connectedDeviceKeys]; }

  onInput(listener: ControllerStateListener): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }
  onRawReport(listener: HidRawReportListener): () => void {
    this.rawListeners.add(listener);
    return () => { this.rawListeners.delete(listener); };
  }
  onDiag(listener: ControllerDiagListener): () => void {
    this.diagListeners.add(listener);
    return () => { this.diagListeners.delete(listener); };
  }
  onDisconnect(listener: ControllerDisconnectListener): () => void {
    this.disconnectListeners.add(listener);
    return () => { this.disconnectListeners.delete(listener); };
  }

  simulateDevice(vid: number, pid: number): void {
    this.connected = true;
    this.log(`[SIM] Simulated device connected: ${vid.toString(16)}:${pid.toString(16)}`);
  }
  simulateInput(state: ControllerInputState): void {
    this.states.set(state.deviceKey, state);
    for (const cb of this.listeners) cb(state);
  }

  // SDL3 controller state, already decoded, bypassing any report parser.
  handleControllerState(deviceKey: string, buttons: boolean[], axes: number[]): void {
    processControllerState(this, deviceKey, buttons, axes);
  }

  /** One HID input report read while a diagnostic raw capture is open (see
   *  native-capture-store.ts). Only one such capture runs at a time, keyed to
   *  vendorId/productId, not a deviceKey, so it is rebuilt here to
   *  match the "vid:pid" form the rest of this store already uses. */
  handleRawReport(report: ControllerRawReport): void {
    const deviceKey = `${toHex4(report.vendorId)}:${toHex4(report.productId)}`;
    const bytes = new Uint8Array(report.bytes);
    this.pushRawLog(`[RAW] ${deviceKey} report=0x${report.reportId.toString(16)} bytes=${bytes.length}`);
    const raw: HidRawReportEvent = { deviceKey, reportId: report.reportId, bytes, timestamp: performance.now() };
    for (const cb of this.rawListeners) cb(raw);
  }

  handleControllerRemoved(deviceKey: string): void {
    this.states.delete(deviceKey);
    this.connectedDeviceKeys.delete(deviceKey);
    this.connected = this.connectedDeviceKeys.size > 0;
    this.log(`Device disconnected: ${deviceKey}`);
    this.addDiag(`Device disconnected: ${deviceKey}`);
    for (const cb of this.disconnectListeners) {
      try { cb(deviceKey, deviceKey); } catch { /* ignore */ }
    }
  }
}

/** Singleton instance */
const controllerInputStore = new ControllerInputStore();

if (typeof window !== 'undefined') {
  (window as any).__controllerInputStore = controllerInputStore;
}

export { controllerInputStore };
export type {
  ControllerDiagListener,
  ControllerDisconnectListener,
  ControllerInputState,
  ControllerStateListener,
  HidRawReportEvent,
  HidRawReportListener,
} from './controller-input-store-types';
export type { StickCalibrationData, DeviceStickCalibration } from './stick-calibration';
