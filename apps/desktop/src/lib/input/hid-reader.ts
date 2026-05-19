/**
 * HID Input Reader — parses raw HID reports received from the main process
 * (node-hid via IPC) into structured button/axis state.
 *
 * All device I/O is handled by node-hid in the Electron main process.
 * This module is purely a parser + state store.
 */

import { CalibrationStore } from './calibration-store';
import { processIpcReport } from './process-hid-report';
import type { IpcPerf, ReportHost } from './process-hid-report';
import type { DeviceStickCalibration, TriggerCalibration } from './stick-calibration';
import type {
  WebHidDiagListener,
  WebHidDisconnectListener,
  WebHidInputState,
  WebHidRawListener,
  WebHidRawReport,
  WebHidStateListener,
} from './hid-reader-types';

class WebHidInputReader implements ReportHost {
  states = new Map<string, WebHidInputState>();
  listeners = new Set<WebHidStateListener>();
  rawListeners = new Set<WebHidRawListener>();
  diagListeners = new Set<WebHidDiagListener>();
  lastReportTime = new Map<string, number>();
  connectedDeviceKeys = new Set<string>();
  connected = false;
  rawReportLog: string[] = [];
  readonly rawLogMax = 100;

  private diagLog: string[] = [];
  private disconnectListeners = new Set<WebHidDisconnectListener>();
  private calibrations = new CalibrationStore();
  private ipcPerf: IpcPerf = { lastTime: 0, gapSum: 0, gapCount: 0, gapMax: 0, burstCount: 0, logTimer: 0 };

  // ── Calibration ──
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

  // ── Diagnostics ──
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
  getStates(): Map<string, WebHidInputState> { return this.states; }
  isConnected(): boolean { return this.connected; }
  getRawReportLog(): string[] { return [...this.rawReportLog]; }
  getConnectedDeviceKeys(): string[] { return [...this.connectedDeviceKeys]; }

  // ── Subscriptions ──
  onInput(listener: WebHidStateListener): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }
  onRawReport(listener: WebHidRawListener): () => void {
    this.rawListeners.add(listener);
    return () => { this.rawListeners.delete(listener); };
  }
  onDiag(listener: WebHidDiagListener): () => void {
    this.diagListeners.add(listener);
    return () => { this.diagListeners.delete(listener); };
  }
  onDisconnect(listener: WebHidDisconnectListener): () => void {
    this.disconnectListeners.add(listener);
    return () => { this.disconnectListeners.delete(listener); };
  }

  // ── Connection ──
  isDeviceStale(deviceKey: string, timeoutMs = 2000): boolean {
    const last = this.lastReportTime.get(deviceKey);
    if (!last) return false;
    return (performance.now() - last) > timeoutMs;
  }
  getTimeSinceLastReport(deviceKey: string): number | null {
    const last = this.lastReportTime.get(deviceKey);
    return last == null ? null : performance.now() - last;
  }
  markDeviceOpened(deviceKey: string, product?: string): void {
    if (!this.connectedDeviceKeys.has(deviceKey)) {
      this.connectedDeviceKeys.add(deviceKey);
      this.connected = true;
      this.lastReportTime.set(deviceKey, performance.now());
      this.log(`Device opened: ${deviceKey}${product ? ` (${product})` : ''}`);
    }
  }

  // ── Simulation (testing) ──
  simulateDevice(vid: number, pid: number): void {
    this.connected = true;
    this.log(`[SIM] Simulated device connected: ${vid.toString(16)}:${pid.toString(16)}`);
  }
  simulateInput(state: WebHidInputState): void {
    this.states.set(state.deviceKey, state);
    for (const cb of this.listeners) cb(state);
  }

  // ── IPC Report Handling ──
  handleIpcReport(deviceKey: string, vendorId: number, productId: number, data: Buffer | number[]): void {
    processIpcReport(this, this.ipcPerf, deviceKey, vendorId, productId, data);
  }

  handleIpcDisconnect(deviceKey: string, error?: string): void {
    this.states.delete(deviceKey);
    this.connectedDeviceKeys.delete(deviceKey);
    this.lastReportTime.delete(deviceKey);
    this.connected = this.connectedDeviceKeys.size > 0;
    if (error) {
      this.log(`IPC device ERROR: ${deviceKey} — ${error}`);
      this.addDiag(`⚠ Device error (${deviceKey}): ${error}. Try unplugging and replugging.`);
    } else {
      this.log(`IPC device disconnected: ${deviceKey}`);
      this.addDiag(`Device disconnected: ${deviceKey}`);
    }
    for (const cb of this.disconnectListeners) {
      try { cb(deviceKey, deviceKey); } catch { /* ignore */ }
    }
  }
}

/** Singleton instance */
const webHidReader = new WebHidInputReader();

if (typeof window !== 'undefined') {
  (window as any).__webHidReader = webHidReader;
}

export { webHidReader };
export type {
  WebHidDiagListener,
  WebHidDisconnectListener,
  WebHidInputState,
  WebHidRawListener,
  WebHidRawReport,
  WebHidStateListener,
} from './hid-reader-types';
export type { StickCalibrationData, DeviceStickCalibration } from './stick-calibration';
