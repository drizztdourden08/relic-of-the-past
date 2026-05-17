/**
 * WebHID Input Reader — reads input from Switch Pro Controller (and similar)
 * using the browser-native WebHID API available in Electron/Chromium.
 *
 * This replaces the node-hid approach (which fails on Windows due to driver conflicts).
 * Proven to work by: https://handheldlegend.github.io/procon2tool/
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

// Nintendo VID and known PIDs
const NINTENDO_VID = 0x057E;
const KNOWN_PIDS: Record<number, string> = {
  0x2009: 'Switch Pro Controller',
  0x2069: 'Switch Pro Controller 2',
  0x2006: 'Joy-Con L',
  0x2007: 'Joy-Con R',
  0x2066: 'Joy-Con 2 L',
  0x2067: 'Joy-Con 2 R',
  0x2073: 'GC Controller',
};

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
  private devices: HIDDevice[] = [];
  private states = new Map<string, WebHidInputState>();
  private listeners = new Set<WebHidStateListener>();
  private rawListeners = new Set<WebHidRawListener>();
  private diagListeners = new Set<WebHidDiagListener>();
  private diagLog: string[] = [];
  private connected = false;
  private disconnectListeners = new Set<WebHidDisconnectListener>();
  private hidDisconnectHandler: ((event: HIDConnectionEvent) => void) | null = null;
  /** Per-device stick calibration, keyed by "vid:pid" */
  private stickCalibrations = new Map<string, DeviceStickCalibration>();

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
  getStates(): Map<string, WebHidInputState> { return this.states; }
  isConnected(): boolean { return this.connected; }
  getDevices(): HIDDevice[] { return [...this.devices]; }

  /**
   * Try to reconnect to previously-granted devices (no user gesture needed).
   * Call this on app startup.
   */
  async autoConnect(): Promise<boolean> {
    if (!('hid' in navigator)) {
      this.log('WebHID not available');
      return false;
    }
    try {
      const devices = await navigator.hid.getDevices();
      const nintendo = devices.filter(
        (d) => d.vendorId === NINTENDO_VID && d.productId in KNOWN_PIDS
      );
      if (nintendo.length === 0) {
        this.log('No previously-granted Nintendo HID devices found, requesting...');
        // In Electron, requestDevice() is auto-handled by select-hid-device session handler
        return this.requestDevice();
      }

      this.log(`Found ${nintendo.length} Nintendo HID interface(s)`);

      // Install global disconnect handler (once)
      this.installDisconnectHandler();

      // Group by VID:PID and try to open one from each group
      const groups = new Map<string, HIDDevice[]>();
      for (const device of nintendo) {
        const key = `${device.vendorId}:${device.productId}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(device);
      }

      for (const [, deviceRefs] of groups) {
        let opened = false;
        for (const device of deviceRefs) {
          if (opened) break;
          opened = await this.openDevice(device);
        }
      }
      return this.connected;
    } catch (err) {
      this.log(`autoConnect error: ${err}`);
      return false;
    }
  }

  /**
   * Request a new device (requires user gesture — button click).
   * Shows the system device picker filtered to Nintendo controllers.
   */
  async requestDevice(): Promise<boolean> {
    if (!('hid' in navigator)) {
      this.log('WebHID not available');
      return false;
    }
    try {
      const filters = Object.keys(KNOWN_PIDS).map((pid) => ({
        vendorId: NINTENDO_VID,
        productId: parseInt(pid),
      }));
      this.log('Requesting HID device...');
      const devices = await navigator.hid.requestDevice({ filters });
      if (devices.length === 0) {
        this.log('No device selected');
        return false;
      }
      for (const device of devices) {
        await this.openDevice(device);
      }
      return this.connected;
    } catch (err) {
      this.log(`requestDevice error: ${err}`);
      return false;
    }
  }

  private installDisconnectHandler(): void {
    if (this.hidDisconnectHandler || !('hid' in navigator)) return;
    this.hidDisconnectHandler = (event: HIDConnectionEvent) => {
      const device = event.device;
      const deviceKey = `${device.vendorId.toString(16)}:${device.productId.toString(16)}`;
      const name = KNOWN_PIDS[device.productId] ?? `Unknown (${device.productId.toString(16)})`;
      this.log(`HID disconnect event: ${name} (${deviceKey})`);

      // Remove from tracked devices
      this.devices = this.devices.filter(d =>
        !(d.vendorId === device.vendorId && d.productId === device.productId)
      );
      this.states.delete(deviceKey);
      this.connected = this.devices.length > 0;

      // Notify listeners
      for (const cb of this.disconnectListeners) {
        try { cb(deviceKey, name); } catch { /* ignore */ }
      }
    };
    navigator.hid.addEventListener('disconnect', this.hidDisconnectHandler);

    // Also listen for reconnect — auto-reopen previously granted devices
    navigator.hid.addEventListener('connect', (event: HIDConnectionEvent) => {
      const device = event.device;
      const pid = device.productId;
      if (device.vendorId === NINTENDO_VID && pid in KNOWN_PIDS) {
        const name = KNOWN_PIDS[pid] ?? 'Unknown';
        this.log(`HID reconnect event: ${name} — attempting to reopen`);
        this.openDevice(device).catch(() => { /* ignore */ });
      }
    });
  }

  private async openDevice(device: HIDDevice): Promise<boolean> {
    const name = KNOWN_PIDS[device.productId] ?? `Unknown (${device.productId.toString(16)})`;
    this.log(`Opening: ${name} (VID:${device.vendorId.toString(16)} PID:${device.productId.toString(16)})`);

    try {
      if (!device.opened) {
        await device.open();
      }
      this.log(`Opened: ${name}`);

      // Install global disconnect handler if not already
      this.installDisconnectHandler();

      device.addEventListener('inputreport', (event) => {
        this.handleInputReport(device, event);
      });

      this.devices.push(device);
      this.connected = true;

      // Send USB initialization for Switch Pro Controllers
      // Without this, many Switch controllers (especially Pro Controller 2)
      // remain silent over USB until they receive the handshake sequence.
      if (device.vendorId === NINTENDO_VID) {
        await this.initSwitchController(device);
      }

      return true;
    } catch (err) {
      this.log(`Failed to open ${name}: ${err}`);
      return false;
    }
  }

  /**
   * Send USB initialization sequence for Nintendo Switch controllers.
   * The controller won't send input reports until this handshake completes.
   */
  private async initSwitchController(device: HIDDevice): Promise<void> {
    const name = KNOWN_PIDS[device.productId] ?? 'Switch Controller';
    this.log(`[Init] Starting USB handshake for ${name}...`);

    // Log available collections for diagnostics
    let outputReportId = 0x80; // default for original Pro Controller
    if (device.collections) {
      for (let i = 0; i < device.collections.length; i++) {
        const col = device.collections[i];
        const inputIds = col.inputReports?.map(r => `0x${r.reportId.toString(16)}`) ?? [];
        const outputIds = col.outputReports?.map(r => `0x${r.reportId.toString(16)}`) ?? [];
        const featureIds = col.featureReports?.map(r => `0x${r.reportId.toString(16)}`) ?? [];
        this.log(`[Init] Collection[${i}]: usage=0x${(col.usage ?? 0).toString(16)} page=0x${(col.usagePage ?? 0).toString(16)} input=[${inputIds}] output=[${outputIds}] feature=[${featureIds}]`);
        // Use the first available output report ID
        if (col.outputReports && col.outputReports.length > 0 && outputReportId === 0x80) {
          outputReportId = col.outputReports[0].reportId;
        }
      }
    }
    this.log(`[Init] Using output report ID: 0x${outputReportId.toString(16)}`);

    // Try various init payloads on the device's actual output report ID
    const attempts: { data: Uint8Array; label: string }[] = [
      // USB handshake: MAC address request
      { data: new Uint8Array([0x80, 0x01]), label: 'MAC req (0x80 0x01)' },
      // USB handshake: handshake
      { data: new Uint8Array([0x80, 0x02]), label: 'Handshake (0x80 0x02)' },
      // USB handshake: USB HID mode
      { data: new Uint8Array([0x80, 0x04]), label: 'USB mode (0x80 0x04)' },
      // Sub-command format: set input mode to full (0x30)
      { data: new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x30]), label: 'SubCmd: mode=full' },
      // Sub-command format: set input mode to simple (0x3F)
      { data: new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x3F]), label: 'SubCmd: mode=simple' },
      // Just zeros — wake up
      { data: new Uint8Array([0x00]), label: 'Wake (0x00)' },
      // Minimal handshake bytes
      { data: new Uint8Array([0x01]), label: 'Byte 0x01' },
      { data: new Uint8Array([0x02]), label: 'Byte 0x02' },
      { data: new Uint8Array([0x04]), label: 'Byte 0x04' },
      // Pro Controller 2 specific: enable reports
      { data: new Uint8Array([0x80, 0x05]), label: 'Enable (0x80 0x05)' },
      // Try padded handshake (64-byte packet like HID expects)
      { data: (() => { const d = new Uint8Array(64); d[0] = 0x80; d[1] = 0x02; return d; })(), label: 'Padded handshake (64B)' },
      { data: (() => { const d = new Uint8Array(64); d[0] = 0x80; d[1] = 0x04; return d; })(), label: 'Padded USB mode (64B)' },
    ];

    let anySuccess = false;
    for (const attempt of attempts) {
      try {
        await device.sendReport(outputReportId, attempt.data);
        this.log(`[Init] ✓ ${attempt.label} succeeded`);
        anySuccess = true;
        await this.delay(50);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.log(`[Init] ✗ ${attempt.label}: ${msg}`);
      }
    }

    // Also try the legacy report IDs in case collection info is wrong
    if (!anySuccess) {
      this.log(`[Init] All attempts on report 0x${outputReportId.toString(16)} failed, trying legacy IDs...`);
      for (const rid of [0x80, 0x01, 0x00]) {
        try {
          await device.sendReport(rid, new Uint8Array([0x02]));
          this.log(`[Init] ✓ Legacy report 0x${rid.toString(16)} succeeded`);
          break;
        } catch { /* skip */ }
      }
    }

    this.log(`[Init] Handshake sequence done for ${name}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private reportIdCounts = new Map<number, number>();

  private handleInputReport(device: HIDDevice, event: HIDInputReportEvent): void {
    const { reportId, data } = event;
    const deviceKey = `${device.vendorId.toString(16)}:${device.productId.toString(16)}`;

    // Log first few reports for diagnostics
    const count = (this.reportIdCounts.get(reportId) ?? 0) + 1;
    this.reportIdCounts.set(reportId, count);
    if (count <= 3) {
      const hex = Array.from(new Uint8Array(data.buffer, data.byteOffset, Math.min(data.byteLength, 20)))
        .map(b => b.toString(16).padStart(2, '0')).join(' ');
      this.log(`Report: id=0x${reportId.toString(16)} len=${data.byteLength} [${hex}]`);
    }

    // DEBUG: Log ALL reports with button state
    console.log(`[HID-RAW] device=${deviceKey} reportId=0x${reportId.toString(16)} len=${data.byteLength}`);

    // Emit raw report for calibration listeners
    if (this.rawListeners.size > 0) {
      const bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
      const raw: WebHidRawReport = { deviceKey, reportId, bytes: new Uint8Array(bytes), timestamp: performance.now() };
      for (const cb of this.rawListeners) cb(raw);
    }

    let parsed: { buttons: boolean[]; axes: number[] } | null = null;

    if (reportId === 0x3F) {
      // Simple mode (USB default)
      parsed = parseSwitchSimple(data);
    } else if (reportId === 0x05) {
      // Switch Pro Controller 2 USB HID mode (report 0x05)
      if (data.byteLength >= 16) {
        const result = parseSwitchPro2Report05(data);
        // Apply stored stick calibration if available
        const cal = this.stickCalibrations.get(deviceKey);
        if (cal) {
          const [lxR, lyR, rxR, ryR] = result.rawSticks;
          result.axes = applySticksCalibration(lxR, lyR, rxR, ryR, cal);
        }
        parsed = result;
      }
    } else if (reportId === 0x09) {
      // Switch Pro Controller 2 alternate USB HID mode
      if (data.byteLength >= 11) {
        parsed = parseSwitchPro2(data);
      }
    } else if (reportId === 0x30) {
      // Full mode (Bluetooth / after init)
      parsed = parseSwitchFull(data);
    } else if (reportId === 0x21 || reportId === 0x31) {
      // Sub-command reply (0x21) or NFC/IR (0x31) — also contain input in same format as 0x30
      if (data.byteLength >= 11) {
        parsed = parseSwitchFull(data);
      }
    }

    if (parsed) {      const pressed = parsed.buttons.map((b, i) => b ? i : -1).filter(i => i >= 0);
      if (pressed.length > 0) {
        console.log(`[HID-PARSED] device=${deviceKey} BUTTONS PRESSED: [${pressed.join(',')}] axes=[${parsed.axes.map(a => a.toFixed(2)).join(',')}]`);
      }      const state: WebHidInputState = {
        deviceKey,
        buttons: parsed.buttons,
        axes: parsed.axes,
        timestamp: performance.now(),
      };
      this.states.set(deviceKey, state);
      for (const cb of this.listeners) cb(state);
      if (count <= 3) {
        this.log(`Parsed OK: ${parsed.buttons.length} buttons, ${parsed.axes.length} axes, pressed=${parsed.buttons.filter(Boolean).length}`);
      }
    } else if (count <= 3) {
      this.log(`No parser matched for reportId=0x${reportId.toString(16)} len=${data.byteLength}`);
    }
  }

  /** Disconnect all devices */
  async disconnect(): Promise<void> {
    for (const device of this.devices) {
      try {
        await device.close();
      } catch { /* ignore */ }
    }
    this.devices = [];
    this.states.clear();
    this.connected = false;
    this.log('Disconnected all devices');
  }

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
}

/** Singleton instance */
export const webHidReader = new WebHidInputReader();

// Expose for Playwright testing
if (typeof window !== 'undefined') {
  (window as any).__webHidReader = webHidReader;
}
