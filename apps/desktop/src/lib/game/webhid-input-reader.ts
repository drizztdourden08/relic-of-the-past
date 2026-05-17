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
  private diagLog: string[] = [];
  private connected = false;
  private disconnectListeners = new Set<WebHidDisconnectListener>();
  /** Per-device stick calibration, keyed by "vid:pid" */
  private stickCalibrations = new Map<string, DeviceStickCalibration>();
  /** Ring buffer of raw HID report hex strings for diagnostics */
  private rawReportLog: string[] = [];
  private static readonly RAW_LOG_MAX = 100;

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
      this.log(`Loaded stick calibrations for ${Object.keys(store).length} device(s)`);
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

  /** Get VID:PID keys of all devices with active HID state (for duplicate filtering) */
  getConnectedDeviceKeys(): string[] { return [...this.states.keys()]; }

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
   * The data array includes the report ID as the first byte.
   * Routes through the same parsers as WebHID inputreport events.
   */
  handleIpcReport(deviceKey: string, vendorId: number, productId: number, data: number[]): void {
    if (data.length === 0) return;

    const reportId = data[0];
    // Create a DataView over the payload (after report ID), matching WebHID convention
    const payload = new Uint8Array(data.slice(1));
    const dataView = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);

    // Track report counts for diagnostics
    const count = (this.reportIdCounts.get(reportId) ?? 0) + 1;
    this.reportIdCounts.set(reportId, count);
    if (count <= 3) {
      const hex = data.slice(0, Math.min(data.length, 20)).map(b => b.toString(16).padStart(2, '0')).join(' ');
      this.log(`IPC Report: id=0x${reportId.toString(16)} len=${payload.byteLength} [${hex}]`);
    }

    // Raw report log for diagnostics (last 100)
    const hex = data.slice(0, Math.min(data.length, 24)).map(b => b.toString(16).padStart(2, '0')).join(' ');
    this.pushRawLog(`[IPC] ${deviceKey} id=0x${reportId.toString(16)} len=${payload.byteLength} ${hex}`);

    // Emit raw report for calibration listeners
    if (this.rawListeners.size > 0) {
      const raw: WebHidRawReport = {
        deviceKey,
        reportId,
        bytes: new Uint8Array(data),
        timestamp: performance.now(),
      };
      for (const cb of this.rawListeners) cb(raw);
    }

    // Parse via controller registry (single source of truth)
    const vid = vendorId.toString(16).padStart(4, '0');
    const pid = productId.toString(16).padStart(4, '0');
    const controller = findController(vid, pid);
    let parsed: { buttons: boolean[]; axes: number[]; rawSticks?: [number, number, number, number] } | null = null;

    if (controller) {
      parsed = controller.parseReport(reportId, dataView);
      // Apply user stick calibration if available and raw sticks were provided
      if (parsed?.rawSticks) {
        const cal = this.stickCalibrations.get(deviceKey);
        if (cal) {
          const [lxR, lyR, rxR, ryR] = parsed.rawSticks;
          parsed.axes = applySticksCalibration(lxR, lyR, rxR, ryR, cal);
        }
      }
    }

    if (parsed) {
      // Mark as connected if not already
      if (!this.connected) {
        this.connected = true;
        this.log(`IPC device connected: ${deviceKey}`);
      }

      const state: WebHidInputState = {
        deviceKey,
        buttons: parsed.buttons,
        axes: parsed.axes,
        timestamp: performance.now(),
      };
      this.states.set(deviceKey, state);
      for (const cb of this.listeners) cb(state);
    } else if (count <= 3) {
      this.log(`No parser matched IPC reportId=0x${reportId.toString(16)} len=${payload.byteLength}`);
    }
  }

  /**
   * Handle device disconnect notification from main process IPC.
   */
  handleIpcDisconnect(deviceKey: string, error?: string): void {
    this.states.delete(deviceKey);
    this.connected = this.states.size > 0;
    if (error) {
      this.log(`IPC device ERROR: ${deviceKey} — ${error}`);
      this.addDiag(`⚠ Device error (${deviceKey}): ${error}. Try unplugging and replugging.`);
    } else {
      this.log(`IPC device disconnected: ${deviceKey}`);
      this.addDiag(`Device disconnected: ${deviceKey}`);
    }
    // Close WebHID write handle if we had one
    const writeHandle = this.writeDevices.get(deviceKey);
    if (writeHandle) {
      try { writeHandle.close(); } catch { /* ignore */ }
      this.writeDevices.delete(deviceKey);
    }
    this.usbInitDone.delete(deviceKey);
    for (const cb of this.disconnectListeners) {
      try { cb(deviceKey, deviceKey); } catch { /* ignore */ }
    }
  }

  // ── WebHID write support (for haptics) ──────────────────────────────────
  // node-hid write() can't send output reports to the SPC2 (no output endpoint
  // in the HID descriptor). WebHID sendReport() uses SET_REPORT control transfer
  // which DOES work — same approach as procon2tool.
  //
  // IMPORTANT: The controller's haptic engine must be enabled via USB bulk
  // initialization (WebUSB) BEFORE HID haptic frames will produce vibration.
  // procon2tool does: USB bulk init → then HID haptic frames.

  /** Cached WebHID device handles used for sendReport, keyed by "vid:pid" */
  private writeDevices = new Map<string, HIDDevice>();

  /** Whether the USB bulk init has been performed for a device key */
  private usbInitDone = new Set<string>();

  /**
   * Get or open a WebHID device handle for writing.
   * Returns null if WebHID is unavailable or device can't be opened.
   */
  private async getWriteDevice(deviceKey: string): Promise<HIDDevice | null> {
    // Return cached handle if still open
    const existing = this.writeDevices.get(deviceKey);
    if (existing?.opened) return existing;

    if (!navigator.hid) {
      this.log('WebHID not available');
      return null;
    }

    const [vidStr, pidStr] = deviceKey.split(':');
    const vid = parseInt(vidStr, 16);
    const pid = parseInt(pidStr, 16);

    try {
      // Request device — Electron auto-selects via select-hid-device handler
      const devices = await navigator.hid.requestDevice({
        filters: [{ vendorId: vid, productId: pid }]
      });
      if (devices.length === 0) {
        this.log(`WebHID: no device returned for ${deviceKey}`);
        return null;
      }
      const device = devices[0];
      if (!device.opened) {
        await device.open();
      }
      this.writeDevices.set(deviceKey, device);
      this.log(`WebHID: opened write handle for ${deviceKey}`);
      return device;
    } catch (e: any) {
      this.log(`WebHID open error: ${e.message}`);
      return null;
    }
  }

  /**
   * Initialize the Switch Pro Controller 2 via WebUSB bulk transfers.
   * This sends the init sequence (INIT_COMMAND_0x03 + ENABLE_HAPTICS)
   * over the USB bulk interface, which is REQUIRED before HID haptic
   * frames will produce vibration. Matches procon2tool's connectUsb().
   */
  private async initUsbBulk(deviceKey: string): Promise<boolean> {
    if (this.usbInitDone.has(deviceKey)) return true;

    if (!navigator.usb) {
      this.log('WebUSB not available');
      return false;
    }

    const [vidStr, pidStr] = deviceKey.split(':');
    const vid = parseInt(vidStr, 16);
    const pid = parseInt(pidStr, 16);

    try {
      const device = await navigator.usb.requestDevice({
        filters: [{ vendorId: vid, productId: pid }]
      });

      await device.open();
      this.log('USB device opened');

      if (!device.configuration) {
        await device.selectConfiguration(1);
      }

      // Interface 1 is the USB bulk interface (same as procon2tool)
      const USB_INTERFACE = 1;
      await device.claimInterface(USB_INTERFACE);
      this.log('USB interface claimed');

      const iface = device.configuration!.interfaces[USB_INTERFACE];
      const endpointOut = iface.alternate.endpoints.find(
        ep => ep.direction === 'out' && ep.type === 'bulk'
      );
      const endpointIn = iface.alternate.endpoints.find(
        ep => ep.direction === 'in' && ep.type === 'bulk'
      );
      if (!endpointOut) {
        this.log('No bulk OUT endpoint found');
        await device.close();
        return false;
      }
      this.log(`Found USB endpoint OUT=0x${endpointOut.endpointNumber.toString(16)}${endpointIn ? ` IN=0x${endpointIn.endpointNumber.toString(16)}` : ''}`);

      const sendCmd = async (data: Uint8Array, label: string) => {
        await device.transferOut(endpointOut.endpointNumber, data);
        await new Promise(r => setTimeout(r, 10));
        // Try to read response (may fail, that's ok)
        if (endpointIn) {
          try {
            await device.transferIn(endpointIn.endpointNumber, 32);
          } catch { /* some commands have no response */ }
        }
        this.log(`Sent ${label}`);
      };

      // Key init commands from procon2tool (minimal set for haptics)
      // 1. INIT_COMMAND_0x03 - starts HID output at 4ms intervals
      await sendCmd(new Uint8Array([
        0x03, 0x91, 0x00, 0x0d, 0x00, 0x08,
        0x00, 0x00, 0x01, 0x00,
        0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF
      ]), 'INIT_COMMAND_0x03');

      // 2. ENABLE_HAPTICS
      await sendCmd(new Uint8Array([
        0x03, 0x91, 0x00, 0x0a, 0x00, 0x04,
        0x00, 0x00, 0x09,
        0x00, 0x00, 0x00
      ]), 'ENABLE_HAPTICS');

      this.log('USB bulk init complete — haptics enabled');
      this.usbInitDone.add(deviceKey);

      // Don't close — keep the USB connection alive so the haptic engine stays enabled
      return true;
    } catch (e: any) {
      this.log(`USB bulk init error: ${e.message}`);
      return false;
    }
  }

  /**
   * Send a single haptic report via WebHID sendReport().
   * reportId is the HID report ID (0x02 for SPC2 haptics).
   * data is the report payload (63 bytes, excluding report ID).
   */
  async sendReport(deviceKey: string, reportId: number, data: Uint8Array): Promise<boolean> {
    const device = await this.getWriteDevice(deviceKey);
    if (!device) return false;
    try {
      await device.sendReport(reportId, data);
      return true;
    } catch (e: any) {
      this.log(`sendReport error: ${e.message}`);
      return false;
    }
  }

  /**
   * Play haptic vibration using WebHID sendReport.
   * Builds and sends frames at ~4ms intervals matching procon2tool format.
   * First performs USB bulk init if not already done.
   */
  async vibrate(deviceKey: string, durationMs: number, intensity: number): Promise<{ ok: boolean; frames: number; errors: number }> {
    // Ensure USB bulk init has been performed (enables haptic engine)
    await this.initUsbBulk(deviceKey);

    const device = await this.getWriteDevice(deviceKey);
    if (!device) return { ok: false, frames: 0, errors: 0 };

    const clamped = Math.max(0, Math.min(1, intensity));
    const STRONG = [0x93, 0x35, 0x36, 0x1c, 0x0d];
    const MEDIUM = [0x75, 0x19, 0x41, 0x9b, 0x03];
    const LIGHT  = [0x48, 0x71, 0x20, 0x5a, 0x02];
    const SILENT = [0x3f, 0x01, 0xf0, 0x19, 0x00];

    const sustain = clamped >= 0.7 ? STRONG : clamped >= 0.3 ? MEDIUM : LIGHT;
    const frameCount = Math.max(1, Math.ceil(durationMs / 4));

    // Build frames: attack, sustain, release, silence
    const frames: number[][] = [];
    if (frameCount > 6) {
      frames.push(LIGHT);
      if (clamped >= 0.3) frames.push(MEDIUM);
    }
    const releaseCount = Math.min(2, Math.max(1, Math.floor(frameCount * 0.1)));
    const sustainCount = Math.max(1, frameCount - frames.length - releaseCount);
    for (let i = 0; i < sustainCount; i++) frames.push(sustain);
    if (releaseCount >= 2 && clamped >= 0.3) frames.push(LIGHT);
    frames.push(SILENT);

    let counter = 0;
    let errors = 0;
    for (const hapticData of frames) {
      const buf = new Uint8Array(63); // 64 - 1 (reportId sent separately)
      buf[0] = 0x50 | (counter & 0x0F); // byte[1] of full report
      buf[16] = buf[0];                  // byte[17] mirror
      for (let i = 0; i < hapticData.length; i++) {
        buf[1 + i] = hapticData[i];      // bytes[2-6] → buf[1-5]
        buf[17 + i] = hapticData[i];     // bytes[18-22] → buf[17-21]
      }
      try {
        await device.sendReport(0x02, buf);
      } catch {
        errors++;
      }
      counter = (counter + 1) & 0x0F;
      // 4ms delay between frames
      await new Promise(r => setTimeout(r, 4));
    }

    return { ok: errors === 0, frames: frames.length, errors };
  }
}

/** Singleton instance */
export const webHidReader = new WebHidInputReader();

// Expose for Playwright testing
if (typeof window !== 'undefined') {
  (window as any).__webHidReader = webHidReader;
}
