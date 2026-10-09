/* @layer renderer-lib @kind logic */
import { processControllerState } from './process-controller-state';
import type { ControllerRawReport } from '@drizztdourden08/brock-input';
import type {
  ControllerDiagListener,
  ControllerDisconnectListener,
  ControllerInputState,
  ControllerStateListener,
  HidRawReportEvent,
  HidRawReportListener,
} from './controller-input-store.type';
import { DIAG_LOG_MAX } from './controller-input-store.constants';

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

  log(msg: string): void {
    const entry = `[${new Date().toLocaleTimeString()}] ${msg}`;
    this.diagLog.push(entry);
    if (this.diagLog.length > DIAG_LOG_MAX) this.diagLog.shift();
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

  handleControllerState(deviceKey: string, buttons: boolean[], axes: number[]): void {
    processControllerState(this, deviceKey, buttons, axes);
  }

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
      try { cb(deviceKey, deviceKey); } catch { continue; }
    }
  }
}

const controllerInputStore = new ControllerInputStore();

if (typeof window !== 'undefined') {
  Object.assign(window, { __controllerInputStore: controllerInputStore });
}

export { controllerInputStore };
export type {
  ControllerDiagListener,
  ControllerDisconnectListener,
  ControllerInputState,
  ControllerStateListener,
  HidRawReportEvent,
  HidRawReportListener,
} from './controller-input-store.type';
