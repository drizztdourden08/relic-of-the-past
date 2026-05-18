/**
 * HID Input Reader — parses raw HID reports received from the main process
 * (node-hid via IPC) into structured button/axis state.
 *
 * All device I/O (opening, reading, init commands) is handled by node-hid
 * in the Electron main process. This module is purely a parser + state store.
 */

import { findController } from '@shared/data/controllers/register-all';

export interface WebHidInputState {
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
export interface WebHidRawReport {
  deviceKey: string;
  reportId: number;
  bytes: Uint8Array;
  timestamp: number;
}

export type WebHidStateListener = (state: WebHidInputState) => void;
export type WebHidRawListener = (report: WebHidRawReport) => void;
export type WebHidDiagListener = (msg: string) => void;

/** Fired when a WebHID device physically disconnects. deviceKey = "vid:pid" */
export type WebHidDisconnectListener = (deviceKey: string, deviceName: string) => void;

// ── Stick calibration types ──

export interface StickCalibrationData {
  centerX: number;
  centerY: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  innerDeadzone: number;
  outerDeadzone: number;
}

export interface DeviceStickCalibration {
  left: StickCalibrationData;
  right: StickCalibrationData;
  updatedAt: string;
}

/** Apply stick calibration: asymmetric normalize → circular clamp → deadzone rescaling */
function applySticksCalibration(
  lxRaw: number, lyRaw: number, rxRaw: number, ryRaw: number,
  cal: DeviceStickCalibration,
): number[] {
  const applyOne = (rawX: number, rawY: number, s: StickCalibrationData) => {
    const rnx = s.centerX - s.minX || 1;
    const rpx = s.maxX - s.centerX || 1;
    const rny = s.centerY - s.minY || 1;
    const rpy = s.maxY - s.centerY || 1;

    const nx = rawX < s.centerX
      ? -(s.centerX - rawX) / rnx
      : (rawX - s.centerX) / rpx;
    // Y inverted (raw Y increases downward, game Y increases upward)
    const ny = rawY < s.centerY
      ? (s.centerY - rawY) / rny
      : -(rawY - s.centerY) / rpy;

    let mag = Math.sqrt(nx * nx + ny * ny);
    let cx = nx, cy = ny;
    if (mag > 1) { cx /= mag; cy /= mag; mag = 1; }

    if (mag < s.innerDeadzone) return { x: 0, y: 0 };

    const rescaled = Math.min(
      (mag - s.innerDeadzone) / (s.outerDeadzone - s.innerDeadzone),
      1,
    );
    const scale = mag > 0 ? rescaled / mag : 0;
    return { x: cx * scale, y: cy * scale };
  };

  const l = applyOne(lxRaw, lyRaw, cal.left);
  const r = applyOne(rxRaw, ryRaw, cal.right);
  return [l.x, l.y, r.x, r.y];
}

class WebHidInputReader {
  private states = new Map<string, WebHidInputState>();
  private listeners = new Set<WebHidStateListener>();
  private rawListeners = new Set<WebHidRawListener>();
  private diagListeners = new Set<WebHidDiagListener>();
  /** Timestamp of last received report per deviceKey */
  private lastReportTime = new Map<string, number>();
  private diagLog: string[] = [];
  private connected = false;
  /** All device keys that have sent at least one IPC report (even if no parser matched) */
  private connectedDeviceKeys = new Set<string>();
  private disconnectListeners = new Set<WebHidDisconnectListener>();
  /** Per-device stick calibration, keyed by "vid:pid" */
  private stickCalibrations = new Map<string, DeviceStickCalibration>();
  /** Per-device trigger calibrations, keyed by "vid:pid:axisIndex" */
  private triggerCalibrations = new Map<string, { base: number; max: number; deadzone: number }>();
  /** Ring buffer of raw HID report hex strings for diagnostics */
  private rawReportLog: string[] = [];
  private static readonly RAW_LOG_MAX = 100;

  // ── IPC Performance Monitor ──
  private _ipcLastTime = 0;
  private _ipcGapSum = 0;
  private _ipcGapCount = 0;
  private _ipcGapMax = 0;
  private _ipcBurstCount = 0; // reports arriving < 1ms apart (batch delivery)
  private _ipcLogTimer = 0;

  /** Load stick calibration for a device (keyed by "vid:pid") */
  setStickCalibration(deviceKey: string, cal: DeviceStickCalibration): void {
    this.stickCalibrations.set(deviceKey, cal);
    this.log(`Stick calibration loaded for ${deviceKey}`);
  }

  /** Get current stick calibration for a device */
  getStickCalibration(deviceKey: string): DeviceStickCalibration | undefined {
    return this.stickCalibrations.get(deviceKey);
  }

  /** Load all calibrations from a store object */
  loadStickCalibrations(store: Record<string, DeviceStickCalibration>): void {
    for (const [key, cal] of Object.entries(store)) {
      this.stickCalibrations.set(key, cal);
    }
    if (Object.keys(store).length > 0) {
      this.log(`Loaded saved stick calibrations (${Object.keys(store).length} profile(s))`);
    }
  }

  /** Set trigger calibration for a specific device + axis */
  setTriggerCalibration(deviceKey: string, axisIndex: number, cal: { base: number; max: number; deadzone: number }): void {
    this.triggerCalibrations.set(`${deviceKey}:${axisIndex}`, cal);
    this.log(`Trigger calibration loaded for ${deviceKey} axis ${axisIndex}`);
  }

  /** Get trigger calibration for a device + axis */
  getTriggerCalibration(deviceKey: string, axisIndex: number): { base: number; max: number; deadzone: number } | undefined {
    return this.triggerCalibrations.get(`${deviceKey}:${axisIndex}`);
  }

  /** Load all trigger calibrations from store */
  loadTriggerCalibrations(store: Record<string, { base: number; max: number; deadzone: number }>): void {
    for (const [key, cal] of Object.entries(store)) {
      this.triggerCalibrations.set(key, cal);
    }
    if (Object.keys(store).length > 0) {
      this.log(`Loaded saved trigger calibrations (${Object.keys(store).length} entry(s))`);
    }
  }

  private log(msg: string): void {
    const entry = `[${new Date().toLocaleTimeString()}] ${msg}`;
    this.diagLog.push(entry);
    if (this.diagLog.length > 100) this.diagLog.shift();
    for (const cb of this.diagListeners) cb(entry);
  }

  /** Subscribe to parsed input state updates */
  onInput(listener: WebHidStateListener): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  /** Subscribe to raw HID reports (for calibration) */
  onRawReport(listener: WebHidRawListener): () => void {
    this.rawListeners.add(listener);
    return () => { this.rawListeners.delete(listener); };
  }

  /** Subscribe to diagnostic messages */
  onDiag(listener: WebHidDiagListener): () => void {
    this.diagListeners.add(listener);
    return () => { this.diagListeners.delete(listener); };
  }

  /** Subscribe to device disconnect events */
  onDisconnect(listener: WebHidDisconnectListener): () => void {
    this.disconnectListeners.add(listener);
    return () => { this.disconnectListeners.delete(listener); };
  }

  getDiagLog(): string[] { return [...this.diagLog]; }

  /** Add an external diagnostic entry to the log (e.g. vibration results) */
  addDiag(msg: string): void { this.log(msg); }
  getStates(): Map<string, WebHidInputState> { return this.states; }
  isConnected(): boolean { return this.connected; }
  getRawReportLog(): string[] { return [...this.rawReportLog]; }

  /** Get VID:PID keys of all devices that have sent IPC reports (for duplicate filtering + UI) */
  getConnectedDeviceKeys(): string[] { return [...this.connectedDeviceKeys]; }

  /** Check if a device is stale (no HID reports for longer than timeoutMs). Default 2s. */
  isDeviceStale(deviceKey: string, timeoutMs = 2000): boolean {
    const last = this.lastReportTime.get(deviceKey);
    if (!last) return false; // never received a report — not stale, just not started
    return (performance.now() - last) > timeoutMs;
  }

  /** Get milliseconds since last report for a device (null if never received) */
  getTimeSinceLastReport(deviceKey: string): number | null {
    const last = this.lastReportTime.get(deviceKey);
    if (!last) return null;
    return performance.now() - last;
  }

  /**
   * Mark a device as connected when the main process opens it (hid:device-opened event).
   * Some devices (e.g. GameCube adapter) don't send HID reports until a button is pressed,
   * so we can't rely on handleIpcReport to set the connected state.
   */
  markDeviceOpened(deviceKey: string, product?: string): void {
    if (!this.connectedDeviceKeys.has(deviceKey)) {
      this.connectedDeviceKeys.add(deviceKey);
      this.connected = true;
      // Start the stale timer — if no reports arrive within 2s, device is stale
      this.lastReportTime.set(deviceKey, performance.now());
      this.log(`Device opened: ${deviceKey}${product ? ` (${product})` : ''}`);
    }
  }

  private pushRawLog(entry: string): void {
    this.rawReportLog.push(entry);
    if (this.rawReportLog.length > WebHidInputReader.RAW_LOG_MAX) {
      this.rawReportLog.shift();
    }
  }

  private reportIdCounts = new Map<number, number>();

  /**
   * Simulate a connected HID device and inject input state.
   * Used for testing — no real device needed.
   */
  simulateDevice(vid: number, pid: number): void {
    this.connected = true;
    const key = `${vid.toString(16)}:${pid.toString(16)}`;
    this.log(`[SIM] Simulated device connected: ${key}`);
  }

  /**
   * Inject a parsed input state as if a real HID report was received.
   * Used for testing — no real device needed.
   */
  simulateInput(state: WebHidInputState): void {
    this.states.set(state.deviceKey, state);
    for (const cb of this.listeners) cb(state);
  }

  /**
   * Process a raw HID report received from the main process (node-hid via IPC).
   * The data includes the report ID as the first byte.
   * Routes through the same parsers as WebHID inputreport events.
   */
  handleIpcReport(deviceKey: string, vendorId: number, productId: number, data: Buffer | number[]): void {
    if (data.length === 0) return;

    // ── IPC timing instrumentation ──
    const now = performance.now();
    if (this._ipcLastTime > 0) {
      const gap = now - this._ipcLastTime;
      this._ipcGapSum += gap;
      this._ipcGapCount++;
      if (gap > this._ipcGapMax) this._ipcGapMax = gap;
      if (gap < 1) this._ipcBurstCount++;
    }
    this._ipcLastTime = now;
    // Log stats every 2 seconds via diag UI
    if (now - this._ipcLogTimer > 2000 && this._ipcGapCount > 0) {
      const avg = (this._ipcGapSum / this._ipcGapCount).toFixed(2);
      this.log(`⚡ IPC: ${this._ipcGapCount} reports, avg=${avg}ms, max=${this._ipcGapMax.toFixed(1)}ms, bursts(<1ms)=${this._ipcBurstCount}`);
      this._ipcGapSum = 0;
      this._ipcGapCount = 0;
      this._ipcGapMax = 0;
      this._ipcBurstCount = 0;
      this._ipcLogTimer = now;
    }

    const reportId = data[0];
    // Create a DataView over the payload (after report ID) — zero-copy from Buffer
    const buf = data instanceof Uint8Array ? data : new Uint8Array(data);
    const dataView = new DataView(buf.buffer, buf.byteOffset + 1, buf.byteLength - 1);

    // Track report counts for initial diagnostics only
    const count = (this.reportIdCounts.get(reportId) ?? 0) + 1;
    this.reportIdCounts.set(reportId, count);
    if (count <= 3) {
      const hex = Array.from(buf.subarray(0, Math.min(buf.length, 20))).map(b => b.toString(16).padStart(2, '0')).join(' ');
      this.log(`IPC Report: id=0x${reportId.toString(16)} len=${buf.byteLength - 1} [${hex}]`);
    }

    // Only format raw log entries when diagnostics are actively being consumed
    if (this.diagListeners.size > 0 && this.rawReportLog.length < WebHidInputReader.RAW_LOG_MAX) {
      const hex = Array.from(buf.subarray(0, Math.min(buf.length, 24))).map(b => b.toString(16).padStart(2, '0')).join(' ');
      this.pushRawLog(`[IPC] ${deviceKey} id=0x${reportId.toString(16)} len=${buf.byteLength - 1} ${hex}`);
    }

    // Emit raw report for calibration listeners (only allocate if anyone is listening)
    if (this.rawListeners.size > 0) {
      const raw: WebHidRawReport = {
        deviceKey,
        reportId,
        bytes: buf,
        timestamp: performance.now(),
      };
      for (const cb of this.rawListeners) cb(raw);
    }

    // Track this device as connected (even before parsing succeeds)
    const vid = vendorId.toString(16).padStart(4, '0');
    const pid = productId.toString(16).padStart(4, '0');
    this.lastReportTime.set(deviceKey, performance.now());
    if (!this.connectedDeviceKeys.has(deviceKey)) {
      this.connectedDeviceKeys.add(deviceKey);
      this.connected = true;
      this.log(`IPC device connected: ${deviceKey} (${vid}:${pid})`);
    }

    // Parse via controller registry (single source of truth)
    const controller = findController(vid, pid);
    let parsed: { buttons: boolean[]; axes: number[]; rawSticks?: [number, number, number, number] } | null = null;

    if (controller) {
      parsed = controller.parseReport(reportId, dataView);
      // Apply user stick calibration if available and raw sticks were provided
      if (parsed?.rawSticks) {
        const cal = this.stickCalibrations.get(deviceKey);
        if (cal) {
          const [lxR, lyR, rxR, ryR] = parsed.rawSticks;
          const calibratedSticks = applySticksCalibration(lxR, lyR, rxR, ryR, cal);
          // Preserve trigger/extra axes beyond the 4 stick axes
          parsed.axes = [...calibratedSticks, ...parsed.axes.slice(4)];
        }
      }

      // Apply trigger calibrations if available
      if (parsed) {
        for (let i = 4; i < parsed.axes.length; i++) {
          const tcal = this.triggerCalibrations.get(`${deviceKey}:${i}`);
          if (tcal) {
            const range = tcal.max - tcal.base;
            if (range > 0) {
              const normalized = Math.max(0, Math.min(1, (parsed.axes[i] - tcal.base) / range));
              parsed.axes[i] = normalized < tcal.deadzone ? 0 : (normalized - tcal.deadzone) / (1 - tcal.deadzone);
            }
          }
        }
      }
    }

    if (parsed) {

      const state: WebHidInputState = {
        deviceKey,
        buttons: parsed.buttons,
        axes: parsed.axes,
        timestamp: performance.now(),
        rawSticks: parsed.rawSticks,
        rawBytes: buf,
        reportId,
      };
      this.states.set(deviceKey, state);
      for (const cb of this.listeners) cb(state);
    } else if (count <= 3) {
      this.log(`No parser matched IPC reportId=0x${reportId.toString(16)} len=${buf.byteLength - 1}`);
    }
  }

  /**
   * Handle device disconnect notification from main process IPC.
   */
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
export const webHidReader = new WebHidInputReader();

// Expose for Playwright testing
if (typeof window !== 'undefined') {
  (window as any).__webHidReader = webHidReader;
}
