/**
 * HID Input Reader — parses raw HID reports received from the main process
 * (node-hid via IPC) into structured button/axis state.
 *
 * All device I/O (opening, reading, init commands) is handled by node-hid
 * in the Electron main process. This module is purely a parser + state store.
 */

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

/**
 * Parse Switch Pro simple input report (report ID 0x3F, 11 bytes of data).
 * This is the default USB HID mode before initialization.
 */
function parseSwitchSimple(data: DataView): { buttons: boolean[]; axes: number[] } {
  // Simple mode report layout (after report ID):
  // Byte 0-1: buttons
  // Byte 2: hat/dpad
  // Byte 3-6: sticks (uint8 centered at 128)
  const b0 = data.getUint8(0);
  const b1 = data.getUint8(1);
  const hat = data.getUint8(2);

  const lx = data.byteLength > 3 ? data.getUint8(3) : 128;
  const ly = data.byteLength > 4 ? data.getUint8(4) : 128;
  const rx = data.byteLength > 5 ? data.getUint8(5) : 128;
  const ry = data.byteLength > 6 ? data.getUint8(6) : 128;

  // Map hat to dpad buttons
  const dUp = hat === 0 || hat === 1 || hat === 7;
  const dRight = hat === 1 || hat === 2 || hat === 3;
  const dDown = hat === 3 || hat === 4 || hat === 5;
  const dLeft = hat === 5 || hat === 6 || hat === 7;

  // Standard gamepad button layout (17 buttons):
  // 0:B, 1:A, 2:Y, 3:X, 4:L, 5:R, 6:ZL, 7:ZR,
  // 8:Minus, 9:Plus, 10:LStick, 11:RStick, 12:Up, 13:Down, 14:Left, 15:Right, 16:Home
  const buttons: boolean[] = [
    !!(b0 & 0x01),       // 0: B (Y on Switch)
    !!(b0 & 0x02),       // 1: A (B on Switch)
    !!(b0 & 0x04),       // 2: Y (X on Switch)
    !!(b0 & 0x08),       // 3: X (A on Switch)
    !!(b0 & 0x10),       // 4: L
    !!(b0 & 0x20),       // 5: R
    !!(b0 & 0x40),       // 6: ZL
    !!(b0 & 0x80),       // 7: ZR
    !!(b1 & 0x01),       // 8: Minus
    !!(b1 & 0x02),       // 9: Plus
    !!(b1 & 0x04),       // 10: L Stick
    !!(b1 & 0x08),       // 11: R Stick
    dUp,                 // 12: DPad Up
    dDown,               // 13: DPad Down
    dLeft,               // 14: DPad Left
    dRight,              // 15: DPad Right
    !!(b1 & 0x10),       // 16: Home
  ];

  // Normalize sticks: 0-255 → -1 to +1
  const axes: number[] = [
    (lx - 128) / 128,
    (ly - 128) / 128,
    (rx - 128) / 128,
    (ry - 128) / 128,
  ];

  return { buttons, axes };
}

/**
 * Parse Switch Pro Controller 2 input report (report ID 0x05, USB HID mode).
 * Byte layout confirmed by real hardware hex dumps:
 *   Byte 0:     Timer/counter (increments by 4)
 *   Byte 1:     Status/battery
 *   Byte 2:     Connection status (varies — NOT button data)
 *   Byte 3:     Padding (0x00)
 *   Byte 4:     Right-side buttons: Y(0x01) X(0x02) B(0x04) A(0x08) ??(0x10) ??(0x20) R(0x40) ZR(0x80)
 *   Byte 5:     Shared buttons:     Minus(0x01) Plus(0x02) RStick(0x04) LStick(0x08) Home(0x10) Capture(0x20) C(0x40)
 *   Byte 6:     Left-side + dpad:   GL(0x01) GR(0x02) DpRight(0x04) DpLeft(0x08) DpDown(0x10) DpUp(0x20) L(0x40) ZL(0x80)
 *   Bytes 7-9:  Padding (0x00)
 *   Bytes 10-12: Left stick  (12-bit X, 12-bit Y packed)
 *   Bytes 13-15: Right stick (12-bit X, 12-bit Y packed)
 */
function parseSwitchPro2Report05(data: DataView): { buttons: boolean[]; axes: number[]; rawSticks: [number, number, number, number] } {
  const b0 = data.getUint8(4);    // right-side face buttons + R/ZR
  const b1 = data.getUint8(5);    // shared (start/select/sticks/home/capture/chat)
  const b2 = data.getUint8(6);    // left-side (L/ZL) + dpad
  const b3 = data.getUint8(7);    // grip buttons (GL/GR)

  // Left stick: 12-bit values packed in 3 bytes (bytes 10-12)
  const lxRaw = data.getUint8(10) | ((data.getUint8(11) & 0x0F) << 8);
  const lyRaw = (data.getUint8(11) >> 4) | (data.getUint8(12) << 4);

  // Right stick: 12-bit values packed in 3 bytes (bytes 13-15)
  const rxRaw = data.getUint8(13) | ((data.getUint8(14) & 0x0F) << 8);
  const ryRaw = (data.getUint8(14) >> 4) | (data.getUint8(15) << 4);

  // Button order matches profile: A, B, X, Y, L, R, ZL, ZR, +, -, LStick, RStick, DUp, DDn, DLt, DRt, Home, Capture, C, GL, GR
  const buttons: boolean[] = [
    !!(b0 & 0x08),       //  0: A
    !!(b0 & 0x04),       //  1: B
    !!(b0 & 0x02),       //  2: X
    !!(b0 & 0x01),       //  3: Y
    !!(b2 & 0x40),       //  4: L
    !!(b0 & 0x40),       //  5: R
    !!(b2 & 0x80),       //  6: ZL
    !!(b0 & 0x80),       //  7: ZR
    !!(b1 & 0x02),       //  8: Plus/Start
    !!(b1 & 0x01),       //  9: Minus/Select
    !!(b1 & 0x08),       // 10: L Stick
    !!(b1 & 0x04),       // 11: R Stick
    !!(b2 & 0x02),       // 12: DPad Up
    !!(b2 & 0x01),       // 13: DPad Down
    !!(b2 & 0x08),       // 14: DPad Left
    !!(b2 & 0x04),       // 15: DPad Right
    !!(b1 & 0x10),       // 16: Home
    !!(b1 & 0x20),       // 17: Capture
    !!(b1 & 0x40),       // 18: C (Chat)
    !!(b3 & 0x02),       // 19: GL  — byte[7]
    !!(b3 & 0x01),       // 20: GR  — byte[7]
  ];

  // Fallback normalization (used when no calibration is loaded).
  // Calibrated normalization is applied in handleInputReport when available.
  let lx = (lxRaw - 2048) / 1000;
  let ly = -(lyRaw - 2048) / 1000;
  let rx = (rxRaw - 2048) / 1000;
  let ry = -(ryRaw - 2048) / 1000;
  const lMag = Math.sqrt(lx * lx + ly * ly);
  if (lMag > 1) { lx /= lMag; ly /= lMag; }
  const rMag = Math.sqrt(rx * rx + ry * ry);
  if (rMag > 1) { rx /= rMag; ry /= rMag; }
  const axes: number[] = [lx, ly, rx, ry];

  return { buttons, axes, rawSticks: [lxRaw, lyRaw, rxRaw, ryRaw] };
}

/**
 * Parse Switch Pro Controller 2 input report (report ID 0x09, alternate USB HID mode).
 * Button layout confirmed via HID calibration — different from 0x30 and 0x3F.
 * Sticks are 12-bit packed (same byte layout as full mode).
 *
 * Report layout (63 bytes after report ID):
 *   Byte 0:   Timer/counter
 *   Byte 1:   Battery/connection
 *   Byte 2:   Right-side buttons: B(0x01) A(0x02) Y(0x04) X(0x08) R(0x10) ZR(0x20) Plus(0x40) RStick(0x80)
 *   Byte 3:   Left-side + dpad:   DpDn(0x01) DpRt(0x02) DpLt(0x04) DpUp(0x08) L(0x10) ZL(0x20) Minus(0x40) LStick(0x80)
 *   Byte 4:   Extra:              Home(0x01) Capture(0x02) GR(0x04) GL(0x08) C/Chat(0x10)
 *   Byte 5-7: Left stick  (12-bit X, 12-bit Y packed)
 *   Byte 8-10: Right stick (12-bit X, 12-bit Y packed)
 *   Byte 11+: IMU/gyro data
 */
function parseSwitchPro2(data: DataView): { buttons: boolean[]; axes: number[] } {
  const b0 = data.getUint8(2); // right-side buttons
  const b1 = data.getUint8(3); // left-side + dpad
  const b2 = data.getUint8(4); // home, capture, gr, gl, c

  // Left stick: 12-bit values packed in 3 bytes (bytes 5-7)
  const lxRaw = data.getUint8(5) | ((data.getUint8(6) & 0x0F) << 8);
  const lyRaw = (data.getUint8(6) >> 4) | (data.getUint8(7) << 4);

  // Right stick: 12-bit values packed in 3 bytes (bytes 8-10)
  const rxRaw = data.getUint8(8) | ((data.getUint8(9) & 0x0F) << 8);
  const ryRaw = (data.getUint8(9) >> 4) | (data.getUint8(10) << 4);

  // Button order matches profile: A, B, X, Y, L, R, ZL, ZR, +, -, LStick, RStick, DUp, DDn, DLt, DRt, Home, Capture, C, GL, GR
  const buttons: boolean[] = [
    !!(b0 & 0x02),       //  0: A
    !!(b0 & 0x01),       //  1: B
    !!(b0 & 0x08),       //  2: X
    !!(b0 & 0x04),       //  3: Y
    !!(b1 & 0x10),       //  4: L
    !!(b0 & 0x10),       //  5: R
    !!(b1 & 0x20),       //  6: ZL
    !!(b0 & 0x20),       //  7: ZR
    !!(b0 & 0x40),       //  8: Plus/Start
    !!(b1 & 0x40),       //  9: Minus/Select
    !!(b1 & 0x80),       // 10: L Stick
    !!(b0 & 0x80),       // 11: R Stick
    !!(b1 & 0x08),       // 12: DPad Up
    !!(b1 & 0x01),       // 13: DPad Down
    !!(b1 & 0x04),       // 14: DPad Left
    !!(b1 & 0x02),       // 15: DPad Right
    !!(b2 & 0x01),       // 16: Home
    !!(b2 & 0x02),       // 17: Capture
    !!(b2 & 0x10),       // 18: C (Chat)
    !!(b2 & 0x08),       // 19: GL
    !!(b2 & 0x04),       // 20: GR
  ];

  // Normalize 12-bit sticks (center ~2048, range 0-4095) → -1 to +1
  const axes: number[] = [
    (lxRaw - 2048) / 2048,
    -(lyRaw - 2048) / 2048, // Y inverted
    (rxRaw - 2048) / 2048,
    -(ryRaw - 2048) / 2048, // Y inverted
  ];

  return { buttons, axes };
}

/**
 * Parse Switch Pro full input report (report ID 0x30, used in Bluetooth/full mode).
 * 12 bytes of button/stick data followed by IMU data.
 */
function parseSwitchFull(data: DataView): { buttons: boolean[]; axes: number[] } {
  // Full report layout (after report ID + timer + battery/conn):
  // Byte 0: timer
  // Byte 1: battery + connection
  // Byte 2-4: buttons (3 bytes)
  // Byte 5-7: left stick (3 bytes, 12-bit each)
  // Byte 8-10: right stick (3 bytes, 12-bit each)
  const offset = 2; // skip timer and battery byte
  const b0 = data.getUint8(offset);
  const b1 = data.getUint8(offset + 1);
  const b2 = data.getUint8(offset + 2);

  // Left stick: 12-bit values packed in 3 bytes
  const lxRaw = data.getUint8(offset + 3) | ((data.getUint8(offset + 4) & 0x0F) << 8);
  const lyRaw = (data.getUint8(offset + 4) >> 4) | (data.getUint8(offset + 5) << 4);

  // Right stick: 12-bit values packed in 3 bytes
  const rxRaw = data.getUint8(offset + 6) | ((data.getUint8(offset + 7) & 0x0F) << 8);
  const ryRaw = (data.getUint8(offset + 7) >> 4) | (data.getUint8(offset + 8) << 4);

  // Buttons (full mode uses different bit layout)
  // b0: Y B A X (right buttons) in bits 0-3, L R in bits 6-7
  // b1: Minus Plus LStick RStick Home Capture ZL ZR
  // b2: Down Up Right Left (dpad)
  const buttons: boolean[] = [
    !!(b0 & 0x04),       // 0: B
    !!(b0 & 0x08),       // 1: A
    !!(b0 & 0x01),       // 2: Y
    !!(b0 & 0x02),       // 3: X
    !!(b0 & 0x40),       // 4: L
    !!(b0 & 0x80),       // 5: R
    !!(b1 & 0x40),       // 6: ZL
    !!(b1 & 0x80),       // 7: ZR
    !!(b1 & 0x01),       // 8: Minus
    !!(b1 & 0x02),       // 9: Plus
    !!(b1 & 0x04),       // 10: L Stick
    !!(b1 & 0x08),       // 11: R Stick
    !!(b2 & 0x02),       // 12: DPad Up
    !!(b2 & 0x01),       // 13: DPad Down
    !!(b2 & 0x08),       // 14: DPad Left
    !!(b2 & 0x04),       // 15: DPad Right
    !!(b1 & 0x10),       // 16: Home
  ];

  // Normalize 12-bit sticks (center ~2048, range 0-4095) → -1 to +1
  const axes: number[] = [
    (lxRaw - 2048) / 2048,
    -(lyRaw - 2048) / 2048, // Y inverted
    (rxRaw - 2048) / 2048,
    -(ryRaw - 2048) / 2048, // Y inverted
  ];

  return { buttons, axes };
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

    // Parse using the same logic as handleInputReport
    let parsed: { buttons: boolean[]; axes: number[] } | null = null;

    if (reportId === 0x3F) {
      parsed = parseSwitchSimple(dataView);
    } else if (reportId === 0x05) {
      if (dataView.byteLength >= 16) {
        const result = parseSwitchPro2Report05(dataView);
        const cal = this.stickCalibrations.get(deviceKey);
        if (cal) {
          const [lxR, lyR, rxR, ryR] = result.rawSticks;
          result.axes = applySticksCalibration(lxR, lyR, rxR, ryR, cal);
        }
        parsed = result;
      }
    } else if (reportId === 0x09) {
      if (dataView.byteLength >= 11) {
        parsed = parseSwitchPro2(dataView);
      }
    } else if (reportId === 0x30) {
      parsed = parseSwitchFull(dataView);
    } else if (reportId === 0x21 || reportId === 0x31) {
      if (dataView.byteLength >= 11) {
        parsed = parseSwitchFull(dataView);
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
  handleIpcDisconnect(deviceKey: string): void {
    this.states.delete(deviceKey);
    this.connected = this.states.size > 0;
    this.log(`IPC device disconnected: ${deviceKey}`);
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
