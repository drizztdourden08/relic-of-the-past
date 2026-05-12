/**
 * HID Input Reader — reads raw HID reports from controllers that need
 * direct HID access (Switch Pro, PlayStation, 8BitDo).
 *
 * Runs in the main process. Sends parsed button/axis state to the renderer
 * via IPC at ~120Hz.
 *
 * Switch Pro Controller HID report format (full report, report ID 0x30):
 *   Byte 0: Report ID (0x30 for full input report)
 *   Byte 1: Timer
 *   Byte 2: Connection info
 *   Byte 3: Button state (Right buttons: Y, X, B, A, SR, SL, R, ZR)
 *   Byte 4: Button state (Shared: Minus, Plus, RStick, LStick, Home, Capture)
 *   Byte 5: Button state (Left buttons: Down, Up, Right, Left, SR, SL, L, ZL)
 *   Bytes 6-8: Left stick (12-bit X, 12-bit Y)
 *   Bytes 9-11: Right stick (12-bit X, 12-bit Y)
 *
 * Simple input report (report ID 0x3F — default before switching to full):
 *   Byte 0: Button state
 *   Byte 1: Button state
 *   Byte 2: Button state
 *   Byte 3: Left stick X (0-255, center=128)
 *   Byte 4: Left stick Y (0-255, center=128)
 *   Byte 5: Right stick X
 *   Byte 6: Right stick Y
 */

import HID from 'node-hid';
import { BrowserWindow } from 'electron';

export interface HidInputState {
  /** Device identifier (vid:pid) */
  deviceKey: string;
  /** Standard gamepad-style button array (16 buttons, true/false) */
  buttons: boolean[];
  /** Standard gamepad-style axes array [leftX, leftY, rightX, rightY] range -1..1 */
  axes: number[];
  /** Timestamp */
  timestamp: number;
}

/** Diagnostic log entry for the renderer to display */
export interface HidDiagEntry {
  time: number;
  level: 'info' | 'warn' | 'error';
  message: string;
}

// ── Switch Pro Controller constants ──

const SWITCH_VID = 0x057e;
const SWITCH_PRO_PIDS = [0x2009, 0x2069]; // Pro Controller, Pro Controller 2

// Report ID 0x3F (simple HID mode — default on USB connection)
// Byte layout for simple mode:
//   [0]  buttons: D-pad in high nibble, face in low nibble
//   [1]  buttons: shoulder/triggers/sticks/home
//   [2]  unused (sometimes hat)
//   [3]  LX (0-255)
//   [4]  LY (0-255)
//   [5]  RX (0-255)
//   [6]  RY (0-255)

// Simple mode button bitmasks (byte 0)
const SIMPLE_B0_Y      = 0x01;
const SIMPLE_B0_X      = 0x02;
const SIMPLE_B0_B      = 0x04;
const SIMPLE_B0_A      = 0x08;
const SIMPLE_B0_R      = 0x40;
const SIMPLE_B0_ZR     = 0x80;

// Simple mode button bitmasks (byte 1)
const SIMPLE_B1_MINUS  = 0x01;
const SIMPLE_B1_PLUS   = 0x02;
const SIMPLE_B1_RSTICK = 0x04;
const SIMPLE_B1_LSTICK = 0x08;
const SIMPLE_B1_HOME   = 0x10;
const SIMPLE_B1_CAPTURE= 0x20;
const SIMPLE_B1_L      = 0x40;
const SIMPLE_B1_ZL     = 0x80;

// Simple mode d-pad (byte 2 — hat switch)
const HAT_UP         = 0;
const HAT_UP_RIGHT   = 1;
const HAT_RIGHT      = 2;
const HAT_DOWN_RIGHT = 3;
const HAT_DOWN       = 4;
const HAT_DOWN_LEFT  = 5;
const HAT_LEFT       = 6;
const HAT_UP_LEFT    = 7;
const HAT_NEUTRAL    = 8;

/**
 * Parse a Switch Pro Controller simple mode report (report ID 0x3F).
 * Returns standard 16-button + 4-axis layout matching Web Gamepad API.
 */
function parseSwitchSimpleReport(data: Buffer): { buttons: boolean[]; axes: number[] } {
  // Data starts after report ID — check if first byte is 0x3F
  const offset = data[0] === 0x3f ? 1 : 0;
  const b0 = data[offset + 0];
  const b1 = data[offset + 1];
  const hat = data[offset + 2];

  // Map to standard gamepad order (same as Chromium's mapping):
  // 0=B(bottom) 1=A(right) 2=Y(left) 3=X(top) 4=L 5=R 6=ZL 7=ZR
  // 8=Minus 9=Plus 10=LStick 11=RStick 12=Up 13=Down 14=Left 15=Right
  const buttons: boolean[] = [
    !!(b0 & SIMPLE_B0_B),       // 0: B (bottom face = SNES B)
    !!(b0 & SIMPLE_B0_A),       // 1: A (right face = SNES A)
    !!(b0 & SIMPLE_B0_Y),       // 2: Y (left face = SNES Y)
    !!(b0 & SIMPLE_B0_X),       // 3: X (top face = SNES X)
    !!(b1 & SIMPLE_B1_L),       // 4: L
    !!(b0 & SIMPLE_B0_R),       // 5: R
    !!(b1 & SIMPLE_B1_ZL),      // 6: ZL
    !!(b0 & SIMPLE_B0_ZR),      // 7: ZR
    !!(b1 & SIMPLE_B1_MINUS),   // 8: Minus (Select)
    !!(b1 & SIMPLE_B1_PLUS),    // 9: Plus (Start)
    !!(b1 & SIMPLE_B1_LSTICK),  // 10: L Stick press
    !!(b1 & SIMPLE_B1_RSTICK),  // 11: R Stick press
    // D-pad from hat switch
    hat === HAT_UP || hat === HAT_UP_RIGHT || hat === HAT_UP_LEFT,      // 12: Up
    hat === HAT_DOWN || hat === HAT_DOWN_RIGHT || hat === HAT_DOWN_LEFT, // 13: Down
    hat === HAT_LEFT || hat === HAT_UP_LEFT || hat === HAT_DOWN_LEFT,    // 14: Left
    hat === HAT_RIGHT || hat === HAT_UP_RIGHT || hat === HAT_DOWN_RIGHT, // 15: Right
  ];

  // Axes: 0-255 → -1..1
  const lx = (data[offset + 3] - 128) / 128;
  const ly = (data[offset + 4] - 128) / 128;
  const rx = (data[offset + 5] - 128) / 128;
  const ry = (data[offset + 6] - 128) / 128;

  return { buttons, axes: [lx, ly, rx, ry] };
}

// ── Full report mode (0x30) — used in Bluetooth ──

/**
 * Parse a Switch Pro Controller full report (report ID 0x30).
 * This is the standard report when connected via Bluetooth or after mode switch.
 */
function parseSwitchFullReport(data: Buffer): { buttons: boolean[]; axes: number[] } {
  // Full report: starts after report ID
  const offset = data[0] === 0x30 ? 1 : 0;
  // Skip timer byte (offset+0) and connection info (offset+1)
  const rightBtns = data[offset + 2]; // Y X B A SR SL R ZR
  const shared    = data[offset + 3]; // Minus Plus RStick LStick Home Capture
  const leftBtns  = data[offset + 4]; // Down Up Right Left SR SL L ZL

  const buttons: boolean[] = [
    !!(rightBtns & 0x04),  // 0: B (bottom)
    !!(rightBtns & 0x08),  // 1: A (right)
    !!(rightBtns & 0x01),  // 2: Y (left)
    !!(rightBtns & 0x02),  // 3: X (top)
    !!(leftBtns & 0x40),   // 4: L
    !!(rightBtns & 0x40),  // 5: R
    !!(leftBtns & 0x80),   // 6: ZL
    !!(rightBtns & 0x80),  // 7: ZR
    !!(shared & 0x01),     // 8: Minus
    !!(shared & 0x02),     // 9: Plus
    !!(shared & 0x08),     // 10: L Stick press
    !!(shared & 0x04),     // 11: R Stick press
    !!(leftBtns & 0x02),   // 12: Up
    !!(leftBtns & 0x01),   // 13: Down
    !!(leftBtns & 0x08),   // 14: Left
    !!(leftBtns & 0x04),   // 15: Right
  ];

  // Left stick: 3 bytes (12-bit X, 12-bit Y)
  const lx_raw = data[offset + 5] | ((data[offset + 6] & 0x0f) << 8);
  const ly_raw = (data[offset + 6] >> 4) | (data[offset + 7] << 4);

  // Right stick: 3 bytes
  const rx_raw = data[offset + 8] | ((data[offset + 9] & 0x0f) << 8);
  const ry_raw = (data[offset + 9] >> 4) | (data[offset + 10] << 4);

  // 12-bit → -1..1 (center ~2048, range 0-4095)
  const normalize12 = (v: number) => Math.max(-1, Math.min(1, (v - 2048) / 2048));

  return {
    buttons,
    axes: [normalize12(lx_raw), -normalize12(ly_raw), normalize12(rx_raw), -normalize12(ry_raw)],
  };
}

// ── HID Reader class ──

interface OpenDevice {
  hid: HID.HID;
  vid: number;
  pid: number;
  key: string; // "vid:pid"
}

class HidInputReader {
  private devices: OpenDevice[] = [];
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private window: BrowserWindow | null = null;
  private latestStates = new Map<string, HidInputState>();
  private diagLog: HidDiagEntry[] = [];

  /** Start reading from all compatible HID controllers */
  start(win: BrowserWindow): void {
    this.window = win;
    this.log('info', 'HID input reader starting...');
    this.scanAndOpen();

    // Re-scan periodically for hot-plug
    this.pollInterval = setInterval(() => this.scanAndOpen(), 3000);
  }

  /** Stop all readers and close devices */
  stop(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    for (const dev of this.devices) {
      try { dev.hid.close(); } catch {}
    }
    this.devices = [];
    this.latestStates.clear();
  }

  /** Get latest state for a device by key (vid:pid) */
  getState(key: string): HidInputState | null {
    return this.latestStates.get(key) ?? null;
  }

  /** Get all current states */
  getAllStates(): HidInputState[] {
    return [...this.latestStates.values()];
  }

  /** Get diagnostic log */
  getDiagLog(): HidDiagEntry[] {
    return this.diagLog;
  }

  private log(level: HidDiagEntry['level'], message: string): void {
    const entry: HidDiagEntry = { time: Date.now(), level, message };
    this.diagLog.push(entry);
    if (this.diagLog.length > 100) this.diagLog.shift();
    console.log(`[HID][${level}] ${message}`);
    // Send to renderer
    if (this.window && !this.window.isDestroyed()) {
      this.window.webContents.send('hid:diag', entry);
    }
  }

  private scanAndOpen(): void {
    const allDevices = HID.devices();

    // Find all Switch Pro Controller interfaces
    const switchInterfaces = allDevices.filter(
      d => d.vendorId === SWITCH_VID && SWITCH_PRO_PIDS.includes(d.productId)
    );

    if (switchInterfaces.length === 0) return;

    const key = `${switchInterfaces[0].vendorId.toString(16).padStart(4, '0')}:${switchInterfaces[0].productId.toString(16).padStart(4, '0')}`;

    // Skip if already open
    if (this.devices.some(d => d.key === key)) return;

    // Log all interfaces found
    this.log('info', `Found ${switchInterfaces.length} HID interface(s) for Switch Pro (${key})`);
    for (const iface of switchInterfaces) {
      this.log('info', `  interface: usagePage=0x${(iface.usagePage ?? 0).toString(16)} usage=0x${(iface.usage ?? 0).toString(16)} path=${iface.path?.slice(0, 60)}`);
    }

    // Prefer the interface with usagePage=0x01 (Generic Desktop) and usage=0x05 (Game Pad)
    // Fall back to usagePage=0x01 usage=0x04 (Joystick)
    // Fall back to any interface
    let target = switchInterfaces.find(d => d.usagePage === 0x01 && d.usage === 0x05);
    if (!target) {
      target = switchInterfaces.find(d => d.usagePage === 0x01 && d.usage === 0x04);
    }
    if (!target) {
      // Try any interface that has a usagePage of 0x01
      target = switchInterfaces.find(d => d.usagePage === 0x01);
    }
    if (!target) {
      target = switchInterfaces[0];
    }

    if (!target.path) {
      this.log('error', `No valid path for ${key}`);
      return;
    }

    this.log('info', `Opening: usagePage=0x${(target.usagePage ?? 0).toString(16)} usage=0x${(target.usage ?? 0).toString(16)}`);

    try {
      const hid = new HID.HID(target.path);
      const dev: OpenDevice = { hid, vid: target.vendorId, pid: target.productId, key };
      this.devices.push(dev);

      // Set up non-blocking read callback
      hid.on('data', (data: Buffer) => {
        this.handleReport(dev, data);
      });

      hid.on('error', (err: Error) => {
        this.log('error', `Device error for ${key}: ${err.message}`);
        this.removeDevice(dev);
      });

      this.log('info', `Successfully opened ${key} (${target.product})`);
    } catch (err) {
      this.log('error', `Failed to open ${key}: ${(err as Error).message}`);
    }
  }

  private handleReport(dev: OpenDevice, data: Buffer): void {
    let parsed: { buttons: boolean[]; axes: number[] } | null = null;

    // Determine report type
    if (data[0] === 0x3f || data.length === 7) {
      // Simple mode report
      parsed = parseSwitchSimpleReport(data);
    } else if (data[0] === 0x30 && data.length >= 12) {
      // Full report mode
      parsed = parseSwitchFullReport(data);
    } else if (data.length >= 7 && data.length <= 12) {
      // Try simple mode (some devices don't prefix report ID)
      parsed = parseSwitchSimpleReport(data);
    }

    if (!parsed) return;

    const state: HidInputState = {
      deviceKey: dev.key,
      buttons: parsed.buttons,
      axes: parsed.axes,
      timestamp: Date.now(),
    };

    this.latestStates.set(dev.key, state);

    // Send to renderer
    if (this.window && !this.window.isDestroyed()) {
      this.window.webContents.send('hid:input', state);
    }
  }

  private removeDevice(dev: OpenDevice): void {
    try { dev.hid.close(); } catch {}
    this.devices = this.devices.filter(d => d !== dev);
    this.latestStates.delete(dev.key);
  }
}

/** Singleton instance */
export const hidInputReader = new HidInputReader();
