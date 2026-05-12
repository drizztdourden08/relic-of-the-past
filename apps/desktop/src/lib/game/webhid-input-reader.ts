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
        this.log('No previously-granted Nintendo HID devices found');
        return false;
      }
      for (const device of nintendo) {
        await this.openDevice(device);
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

  private async openDevice(device: HIDDevice): Promise<void> {
    const name = KNOWN_PIDS[device.productId] ?? `Unknown (${device.productId.toString(16)})`;
    this.log(`Opening: ${name} (VID:${device.vendorId.toString(16)} PID:${device.productId.toString(16)})`);

    try {
      if (!device.opened) {
        await device.open();
      }
      this.log(`Opened: ${name}`);

      device.addEventListener('inputreport', (event) => {
        this.handleInputReport(device, event);
      });

      this.devices.push(device);
      this.connected = true;
    } catch (err) {
      this.log(`Failed to open ${name}: ${err}`);
    }
  }

  private handleInputReport(device: HIDDevice, event: HIDInputReportEvent): void {
    const { reportId, data } = event;
    const deviceKey = `${device.vendorId.toString(16)}:${device.productId.toString(16)}`;

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
    } else if (reportId === 0x30) {
      // Full mode (Bluetooth / after init)
      parsed = parseSwitchFull(data);
    } else if (reportId === 0x21 || reportId === 0x31) {
      // Sub-command reply (0x21) or NFC/IR (0x31) — also contain input in same format as 0x30
      if (data.byteLength >= 11) {
        parsed = parseSwitchFull(data);
      }
    }

    if (parsed) {
      const state: WebHidInputState = {
        deviceKey,
        buttons: parsed.buttons,
        axes: parsed.axes,
        timestamp: performance.now(),
      };
      this.states.set(deviceKey, state);
      for (const cb of this.listeners) cb(state);
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
}

/** Singleton instance */
export const webHidReader = new WebHidInputReader();
