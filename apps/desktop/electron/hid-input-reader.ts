/**
 * HID Input Reader — reads raw HID reports from game controllers
 * using node-hid in the main process.
 *
 * Supports any controller that exposes a standard HID gamepad interface.
 * Xbox controllers are excluded (they use XInput, not HID, on Windows).
 *
 * For Nintendo Switch controllers, sends USB init commands (handshake,
 * USB mode switch, full-report-mode) via node-hid write() after opening.
 *
 * Raw reports are forwarded to the renderer via IPC where existing parsers
 * in webhid-input-reader.ts handle the decoding.
 */

import HID from 'node-hid';
import { BrowserWindow } from 'electron';

// Xbox VID — excluded because Windows XInput driver claims exclusive access
const XBOX_VID = 0x045e;

// Nintendo VID
const NINTENDO_VID = 0x057e;

// Original Nintendo controllers that need the legacy USB init sequence
// (report IDs 0x80/0x01 via HID). The Switch Pro Controller 2 (0x2069)
// uses a different init via WebUSB bulk transfers in the renderer.
const NINTENDO_LEGACY_INIT_PIDS = new Set([
  0x2009, // Switch Pro Controller (original)
  0x2006, // Joy-Con L
  0x2007, // Joy-Con R
]);

// All known Nintendo controller PIDs (for general identification)
const NINTENDO_PIDS = new Set([
  0x2009, // Switch Pro Controller
  0x2069, // Switch Pro Controller 2
  0x2006, // Joy-Con L
  0x2007, // Joy-Con R
  0x2066, // Joy-Con 2 L
  0x2067, // Joy-Con 2 R
  0x2073, // GC Controller
]);

/** HID usage pages/usages that indicate a game controller */
const GAMEPAD_USAGE_PAGES = new Set([0x01]); // Generic Desktop
const GAMEPAD_USAGES = new Set([
  0x04, // Joystick
  0x05, // Game Pad
  0x08, // Multi-axis Controller
]);

function toHex4(n: number): string {
  return n.toString(16).padStart(4, '0');
}

interface OpenDevice {
  hid: HID.HID;        // read handle (has data listener)
  hidWrite: HID.HID;   // write-only handle (no listeners — avoids write blocking)
  vid: number;
  pid: number;
  key: string; // "vid:pid" (hex, 4-char padded — matches WebHID deviceKey format)
  path: string;
  product: string;
}

export class HidInputReader {
  private devices: OpenDevice[] = [];
  private scanInterval: ReturnType<typeof setInterval> | null = null;
  private window: BrowserWindow | null = null;

  /** Start scanning for controllers and reading input. */
  start(win: BrowserWindow): void {
    this.window = win;
    this.log(`HID input reader starting...`);
    this.scanAndOpen();
    // Re-scan every 3s for hot-plug
    this.scanInterval = setInterval(() => this.scanAndOpen(), 3000);
  }

  /** Stop all readers and close devices. */
  stop(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    for (const dev of this.devices) {
      try { dev.hid.close(); } catch { /* ignore */ }
    }
    this.devices = [];
  }

  /** Get list of currently open device keys */
  getOpenDeviceKeys(): string[] {
    return this.devices.map(d => d.key);
  }

  private log(msg: string): void {
    console.log(`[HID] ${msg}`);
  }

  private scanAndOpen(): void {
    const allDevices = HID.devices();

    // Find all gamepad-like HID interfaces (excluding Xbox)
    // Require gamepad usage (page=0x01, usage=0x04/0x05/0x08) to avoid
    // opening mice/keyboards from manufacturers that also make controllers.
    const candidates = allDevices.filter(d => {
      if (d.vendorId === XBOX_VID) return false;
      const isGamepadUsage = GAMEPAD_USAGE_PAGES.has(d.usagePage ?? 0) &&
                             GAMEPAD_USAGES.has(d.usage ?? 0);
      return isGamepadUsage;
    });

    // Group by VID:PID
    const groups = new Map<string, typeof candidates>();
    for (const d of candidates) {
      const key = `${toHex4(d.vendorId)}:${toHex4(d.productId)}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(d);
    }

    for (const [key, interfaces] of groups) {
      // Skip if already open
      if (this.devices.some(d => d.key === key)) continue;

      // Prefer usagePage=0x01 usage=0x05 (Game Pad), then 0x04 (Joystick), then any 0x01
      let target = interfaces.find(d => d.usagePage === 0x01 && d.usage === 0x05);
      if (!target) target = interfaces.find(d => d.usagePage === 0x01 && d.usage === 0x04);
      if (!target) target = interfaces.find(d => d.usagePage === 0x01);
      if (!target) target = interfaces[0];

      if (!target.path) continue;

      this.log(`Opening ${key} (${target.product || 'Unknown'}) usagePage=0x${(target.usagePage ?? 0).toString(16)} usage=0x${(target.usage ?? 0).toString(16)}`);

      try {
        const hid = new HID.HID(target.path);
        // Open a second handle to the same path for writes only.
        // node-hid's write() blocks when a read listener is active on the same handle.
        let hidWrite: HID.HID;
        try {
          hidWrite = new HID.HID(target.path);
        } catch {
          hidWrite = hid; // fallback to shared handle
        }
        const dev: OpenDevice = {
          hid,
          hidWrite,
          vid: target.vendorId,
          pid: target.productId,
          key,
          path: target.path,
          product: target.product || 'Unknown Controller',
        };
        this.devices.push(dev);

        hid.on('data', (data: Buffer) => {
          this.forwardReport(dev, data);
        });

        hid.on('error', (err: Error) => {
          this.log(`Device error ${key}: ${err.message}`);
          this.removeDevice(dev);
          // Notify renderer of disconnect
          this.send('hid:disconnect', { deviceKey: key, product: dev.product });
        });

        this.log(`Opened ${key} (${dev.product})`);
        // Notify renderer a new device is available
        this.send('hid:device-opened', {
          deviceKey: key,
          vendorId: toHex4(target.vendorId),
          productId: toHex4(target.productId),
          product: dev.product,
        });

        // Send USB init sequence for original Nintendo controllers only.
        if (target.vendorId === NINTENDO_VID && NINTENDO_LEGACY_INIT_PIDS.has(target.productId)) {
          this.initNintendoController(dev);
        }
      } catch (err) {
        this.log(`Failed to open ${key}: ${(err as Error).message}`);
      }
    }
  }

  /**
   * Forward raw HID report to the renderer.
   * The first byte of the buffer is the report ID.
   */
  private forwardReport(dev: OpenDevice, data: Buffer): void {
    if (!this.window || this.window.isDestroyed()) return;
    // Convert to a plain array for IPC serialization
    this.window.webContents.send('hid:report', {
      deviceKey: dev.key,
      vendorId: dev.vid,
      productId: dev.pid,
      data: Array.from(data),
    });
  }

  /**
   * Send USB init commands for Nintendo Switch controllers via node-hid write().
   * Sequence: MAC request → handshake → USB mode → set full report mode.
   */
  private async initNintendoController(dev: OpenDevice): Promise<void> {
    this.log(`[Init] Sending USB init for ${dev.key} (${dev.product})...`);

    // node-hid write(): first byte = report ID, rest = payload.
    // Buffer padded to 64 bytes (Switch Pro Controller output report size).
    const cmds: { data: number[]; label: string }[] = [
      { data: [0x80, 0x01], label: 'MAC req' },
      { data: [0x80, 0x02], label: 'Handshake' },
      { data: [0x80, 0x04], label: 'USB mode' },
      // Output report 0x01: subcmd 0x03 (set input report mode), mode=0x30 (full)
      { data: [0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x30], label: 'SubCmd: mode=full' },
    ];

    for (const cmd of cmds) {
      try {
        const buf = new Array(64).fill(0);
        for (let i = 0; i < cmd.data.length; i++) buf[i] = cmd.data[i];
        dev.hidWrite.write(buf);
        this.log(`[Init] ✓ ${cmd.label}`);
        await this.delay(50);
      } catch (err) {
        this.log(`[Init] ✗ ${cmd.label}: ${(err as Error).message}`);
      }
    }
    this.log(`[Init] USB init done for ${dev.key}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private removeDevice(dev: OpenDevice): void {
    try { dev.hid.close(); } catch { /* ignore */ }
    if (dev.hidWrite !== dev.hid) {
      try { dev.hidWrite.close(); } catch { /* ignore */ }
    }
    this.devices = this.devices.filter(d => d !== dev);
  }

  /** Write raw data to an open HID device (for haptics, LED, etc.)
   *  On Windows, node-hid requires the buffer to match the HID output report size.
   *  For Switch controllers this is 64 bytes. Data is zero-padded as needed. */
  write(deviceKey: string, data: number[]): boolean {
    const dev = this.devices.find(d => d.key === deviceKey);
    if (!dev) return false;
    try {
      // Pad to 64 bytes (Switch Pro Controller output report size)
      const buf = new Array(64).fill(0);
      for (let i = 0; i < Math.min(data.length, 64); i++) buf[i] = data[i];
      dev.hidWrite.write(buf);
      return true;
    } catch (err) {
      this.log(`Write error ${deviceKey}: ${(err as Error).message}`);
      return false;
    }
  }

  // Known-working haptic data from procon2tool TEST_HAPTIC_PATTERN
  private static readonly HAPTIC_STRONG: number[] = [0x93, 0x35, 0x36, 0x1c, 0x0d];
  private static readonly HAPTIC_MEDIUM: number[] = [0x75, 0x19, 0x41, 0x9b, 0x03];
  private static readonly HAPTIC_LIGHT:  number[] = [0x48, 0x71, 0x20, 0x5a, 0x02];
  private static readonly HAPTIC_SILENT: number[] = [0x3f, 0x01, 0xf0, 0x19, 0x00];

  /**
   * Vibrate an HID controller for a given duration and intensity.
   * Pauses the read listener during writes (node-hid can't read+write simultaneously).
   * Writes all frames synchronously then resumes reading.
   */
  vibrate(deviceKey: string, durationMs: number, intensity: number): boolean {
    const dev = this.devices.find(d => d.key === deviceKey);
    if (!dev) return false;

    const clamped = Math.max(0, Math.min(1, intensity));
    const sustain = clamped >= 0.7 ? HidInputReader.HAPTIC_STRONG
      : clamped >= 0.3 ? HidInputReader.HAPTIC_MEDIUM
      : HidInputReader.HAPTIC_LIGHT;

    const frameCount = Math.max(1, Math.ceil(durationMs / 4));

    // Build frame list: short attack, sustain, release, silence
    const frames: number[][] = [];
    if (frameCount > 6) {
      frames.push(HidInputReader.HAPTIC_LIGHT);
      if (clamped >= 0.3) frames.push(HidInputReader.HAPTIC_MEDIUM);
    }
    const releaseCount = Math.min(2, Math.max(1, Math.floor(frameCount * 0.1)));
    const sustainCount = Math.max(1, frameCount - frames.length - releaseCount);
    for (let i = 0; i < sustainCount; i++) frames.push(sustain);
    if (releaseCount >= 2 && clamped >= 0.3) frames.push(HidInputReader.HAPTIC_LIGHT);
    frames.push(HidInputReader.HAPTIC_SILENT);

    // Pause reader, write all frames, resume reader
    dev.hid.pause();
    let counter = 0;
    let errors = 0;
    for (const hapticData of frames) {
      const buf = new Array(64).fill(0);
      buf[0] = 0x02;
      buf[1] = 0x50 | (counter & 0x0F);
      buf[17] = buf[1];
      for (let i = 0; i < hapticData.length; i++) {
        buf[2 + i] = hapticData[i];
        buf[18 + i] = hapticData[i];
      }
      try {
        dev.hid.write(buf);
      } catch {
        errors++;
      }
      counter = (counter + 1) & 0x0F;
    }
    dev.hid.resume();

    return errors === 0;
  }

  /**
   * Flat vibrate: constant intensity for a duration, no envelope shaping.
   * Pattern support: array of {durationMs, intensity} segments with gaps between.
   */
  vibratePattern(deviceKey: string, pattern: { durationMs: number; intensity: number }[], gapMs: number = 0): boolean {
    const dev = this.devices.find(d => d.key === deviceKey);
    if (!dev) {
      console.log(`[vibratePattern] no device for key="${deviceKey}", have: [${this.devices.map(d => d.key).join(', ')}]`);
      return false;
    }
    console.log(`[vibratePattern] key="${deviceKey}" pattern=${pattern.length} segments, gap=${gapMs}ms`);

    const segments: { haptic: number[]; frames: number }[] = [];
    for (const seg of pattern) {
      const clamped = Math.max(0, Math.min(1, seg.intensity));
      const haptic = clamped >= 0.7 ? HidInputReader.HAPTIC_STRONG
        : clamped >= 0.3 ? HidInputReader.HAPTIC_MEDIUM
        : HidInputReader.HAPTIC_LIGHT;
      segments.push({ haptic, frames: Math.max(1, Math.ceil(seg.durationMs / 4)) });
    }

    const gapFrames = Math.max(0, Math.ceil(gapMs / 4));

    dev.hid.pause();
    let counter = 0;
    let errors = 0;

    for (let s = 0; s < segments.length; s++) {
      const { haptic, frames } = segments[s];
      for (let i = 0; i < frames; i++) {
        const buf = new Array(64).fill(0);
        buf[0] = 0x02;
        buf[1] = 0x50 | (counter & 0x0F);
        buf[17] = buf[1];
        for (let j = 0; j < haptic.length; j++) {
          buf[2 + j] = haptic[j];
          buf[18 + j] = haptic[j];
        }
        try { dev.hid.write(buf); } catch { errors++; }
        counter = (counter + 1) & 0x0F;
      }
      // Gap between segments (silence frames)
      if (gapFrames > 0 && s < segments.length - 1) {
        for (let i = 0; i < gapFrames; i++) {
          const buf = new Array(64).fill(0);
          buf[0] = 0x02;
          buf[1] = 0x50 | (counter & 0x0F);
          buf[17] = buf[1];
          for (let j = 0; j < HidInputReader.HAPTIC_SILENT.length; j++) {
            buf[2 + j] = HidInputReader.HAPTIC_SILENT[j];
            buf[18 + j] = HidInputReader.HAPTIC_SILENT[j];
          }
          try { dev.hid.write(buf); } catch { errors++; }
          counter = (counter + 1) & 0x0F;
        }
      }
    }
    // End with silence
    const buf = new Array(64).fill(0);
    buf[0] = 0x02;
    buf[1] = 0x50 | (counter & 0x0F);
    buf[17] = buf[1];
    for (let j = 0; j < HidInputReader.HAPTIC_SILENT.length; j++) {
      buf[2 + j] = HidInputReader.HAPTIC_SILENT[j];
      buf[18 + j] = HidInputReader.HAPTIC_SILENT[j];
    }
    try { dev.hid.write(buf); } catch { errors++; }
    dev.hid.resume();

    return errors === 0;
  }

  /**
   * Test vibration: pause reader, write the full procon2tool pattern, resume reader.
   * node-hid write() fails when a read listener is active on the same device,
   * so we must pause reads during haptic output.
   */
  testVibration(deviceKey: string): { ok: boolean; frames: number; errors: number; writeMs: number; error?: string } {
    const dev = this.devices.find(d => d.key === deviceKey);
    if (!dev) {
      return { ok: false, frames: 0, errors: 0, writeMs: 0, error: `no device for key="${deviceKey}"` };
    }

    const pattern: number[][] = [
      [0x93, 0x35, 0x36, 0x1c, 0x0d],
      [0xa8, 0x29, 0xc5, 0xdc, 0x0c],
      [0x75, 0x21, 0xb5, 0x5d, 0x13],
      [0x75, 0xf5, 0x70, 0x1e, 0x11],
      [0xba, 0x55, 0x40, 0x1e, 0x08],
      [0x90, 0x31, 0x10, 0x9e, 0x00],
      [0x90, 0x15, 0x10, 0x9e, 0x00],
      [0x90, 0x15, 0x10, 0x9e, 0x00],
      [0x90, 0x01, 0x10, 0x1e, 0x00],
      [0x90, 0x15, 0x10, 0x9e, 0x00],
      [0x75, 0x15, 0x73, 0x1e, 0x11],
      [0x7b, 0x95, 0x92, 0x5c, 0x13],
      [0x8d, 0xc5, 0xa1, 0x1b, 0x10],
      [0x7e, 0x31, 0xc1, 0xdc, 0x0b],
      [0x6f, 0x2d, 0x31, 0xdc, 0x03],
      [0x75, 0x19, 0x41, 0x9b, 0x03],
      [0x6f, 0x15, 0xe1, 0xda, 0x02],
      [0x66, 0xf1, 0xe0, 0xda, 0x02],
      [0x63, 0xdd, 0x10, 0x5b, 0x02],
      [0x5a, 0xb9, 0x10, 0x5b, 0x02],
      [0x4e, 0x99, 0x50, 0x5a, 0x02],
      [0x45, 0x81, 0x20, 0x5a, 0x02],
      [0x48, 0x85, 0x50, 0x5a, 0x02],
      [0x4b, 0x85, 0x50, 0x5a, 0x02],
      [0x4b, 0x7d, 0x80, 0x5a, 0x02],
      [0x48, 0x71, 0x20, 0x5a, 0x02],
      [0x48, 0x71, 0xc0, 0x99, 0x02],
      [0x45, 0x65, 0x90, 0x99, 0x02],
      [0x42, 0x61, 0x90, 0x99, 0x02],
      [0x3c, 0x59, 0xd0, 0x98, 0x02],
      [0x3f, 0x01, 0xf0, 0x19, 0x00],
      [0x3f, 0x01, 0xf0, 0x19, 0x00],
    ];

    // Pause the read listener so writes can succeed
    dev.hid.pause();

    const start = performance.now();
    let errors = 0;
    let counter = 0;

    for (const hapticData of pattern) {
      const buf = new Array(64).fill(0);
      buf[0] = 0x02;
      buf[1] = 0x50 | (counter & 0x0F);
      buf[17] = buf[1];
      for (let i = 0; i < hapticData.length; i++) {
        buf[2 + i] = hapticData[i];
        buf[18 + i] = hapticData[i];
      }
      try {
        dev.hid.write(buf);
      } catch {
        errors++;
      }
      counter = (counter + 1) & 0x0F;
    }

    const elapsed = Math.round(performance.now() - start);

    // Resume reading
    dev.hid.resume();

    return { ok: errors === 0, frames: pattern.length, errors, writeMs: elapsed };
  }

  private send(channel: string, data: unknown): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.webContents.send(channel, data);
    }
  }
}

/** Singleton instance */
export const hidInputReader = new HidInputReader();
