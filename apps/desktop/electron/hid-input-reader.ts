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
import { Worker } from 'worker_threads';
import path from 'path';
import { sendUsbInit } from './usb-init';

// Xbox VID — excluded because Windows XInput driver claims exclusive access
const XBOX_VID = 0x045e;

// Nintendo VID
const NINTENDO_VID = 0x057e;

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
  hid: HID.HID;
  vid: number;
  pid: number;
  key: string; // "vid:pid" (hex, 4-char padded — matches WebHID deviceKey format)
  path: string;
  product: string;
  writeFailed?: boolean;
}

export class HidInputReader {
  private devices: OpenDevice[] = [];
  private scanInterval: ReturnType<typeof setInterval> | null = null;
  private window: BrowserWindow | null = null;
  private worker: Worker | null = null;
  private workerReqId = 0;
  private workerCallbacks = new Map<number, (result: any) => void>();

  /** Lazy-start the persistent HID worker thread. */
  private ensureWorker(): Worker {
    if (!this.worker) {
      const workerPath = path.join(__dirname, 'hid-worker.js');
      this.worker = new Worker(workerPath);
      this.worker.on('message', (msg: { id: number; [k: string]: any }) => {
        const cb = this.workerCallbacks.get(msg.id);
        if (cb) {
          this.workerCallbacks.delete(msg.id);
          cb(msg);
        }
      });
      this.worker.on('error', (err) => {
        this.log(`HID worker error: ${err.message}`);
      });
    }
    return this.worker;
  }

  /** Send a message to the worker and get a Promise for the response. */
  private workerRequest<T = any>(msg: Record<string, any>): Promise<T> {
    const id = ++this.workerReqId;
    const w = this.ensureWorker();
    return new Promise<T>((resolve) => {
      this.workerCallbacks.set(id, resolve);
      w.postMessage({ ...msg, id });
    });
  }

  /** Non-blocking device enumeration via worker thread. */
  async enumerateDevicesAsync(): Promise<HID.Device[]> {
    const result = await this.workerRequest<{ ok: boolean; devices?: HID.Device[]; error?: string }>({ type: 'enumerate' });
    if (result.ok && result.devices) return result.devices;
    throw new Error(result.error ?? 'enumerate failed');
  }

  /** Start scanning for controllers and reading input. */
  start(win: BrowserWindow): void {
    this.window = win;
    this.log(`HID input reader starting...`);
    this.scanAndOpen();
    // Re-scan every 3s for hot-plug — async, never blocks main thread
    this.scanInterval = setInterval(() => this.scanAndOpen(), 3000);
  }

  /** Stop all readers and close devices. Sends SILENT haptic frame before closing. */
  stop(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    // Terminate the worker thread
    if (this.worker) {
      this.worker.terminate().catch(() => {});
      this.worker = null;
      this.workerCallbacks.clear();
    }
    for (const dev of this.devices) {
      // Send SILENT haptic frame to stop any running vibration before closing
      try {
        const buf = new Array(64).fill(0);
        buf[0] = 0x02;
        buf[1] = 0x50;
        buf[17] = 0x50;
        // HAPTIC_SILENT pattern
        const silent = [0x3f, 0x01, 0xf0, 0x19, 0x00];
        for (let i = 0; i < silent.length; i++) {
          buf[2 + i] = silent[i];
          buf[18 + i] = silent[i];
        }
        dev.hid.pause();
        dev.hid.write(buf);
        dev.hid.resume();
      } catch { /* ignore — best effort cleanup */ }
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

  private async scanAndOpen(): Promise<void> {
    let allDevices: HID.Device[];
    try {
      allDevices = await this.enumerateDevicesAsync();
    } catch {
      return; // worker error — skip this scan
    }

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

    // Remove devices that disappeared from enumeration (unplugged)
    const enumeratedKeys = new Set(groups.keys());
    for (const dev of [...this.devices]) {
      if (!enumeratedKeys.has(dev.key)) {
        this.log(`Device ${dev.key} (${dev.product}) no longer enumerated — removing`);
        this.removeDevice(dev);
        this.send('hid:disconnect', { deviceKey: dev.key, product: dev.product });
      }
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
        // Nintendo controllers need USB init on interface 1 before HID reports flow
        if (target.vendorId === NINTENDO_VID && NINTENDO_PIDS.has(target.productId)) {
          try {
            const ok = await sendUsbInit(target.vendorId, target.productId);
            if (ok) this.log(`USB init succeeded for ${key}`);
          } catch (err) {
            this.log(`USB init attempt for ${key}: ${(err as Error).message}`);
          }
        }

        const hid = new HID.HID(target.path);
        const dev: OpenDevice = {
          hid,
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
          this.send('hid:disconnect', { deviceKey: key, product: dev.product, error: err.message });
        });

        this.log(`Opened ${key} (${dev.product})`);

        // SPC2 needs a wake-up haptic poke after USB enumeration.
        // The USB init (sendUsbInit) already started HID streaming.
        // Send a silent haptic frame as additional acknowledgment.
        // Only SPC2 (0x2069) supports haptic writes — GC adapter and others don't.
        if (target.vendorId === NINTENDO_VID && target.productId === 0x2069) {
          try {
            const wake = new Array(64).fill(0);
            wake[0] = 0x02; // report ID
            wake[1] = 0x50; // haptic counter byte
            wake[17] = 0x50;
            const silent = [0x3f, 0x01, 0xf0, 0x19, 0x00];
            for (let i = 0; i < silent.length; i++) {
              wake[2 + i] = silent[i];
              wake[18 + i] = silent[i];
            }
            hid.pause();
            try {
              hid.write(wake);
              this.log(`Sent wake-up haptic frame to ${key}`);
            } finally {
              hid.resume();
            }
          } catch (err) {
            this.log(`Wake-up write failed for ${key}: ${(err as Error).message}`);
          }
        }

        // Notify renderer a new device is available
        this.send('hid:device-opened', {
          deviceKey: key,
          vendorId: toHex4(target.vendorId),
          productId: toHex4(target.productId),
          product: dev.product,
        });
      } catch (err) {
        this.log(`Failed to open ${key}: ${(err as Error).message}`);
      }
    }
  }

  // ── Main-process send timing ──
  private _fwdLastTime = 0;
  private _fwdGapMax = 0;
  private _fwdBursts = 0;
  private _fwdCount = 0;
  private _fwdLogTime = 0;

  /**
   * Forward raw HID report to the renderer.
   * The first byte of the buffer is the report ID.
   */
  private forwardReport(dev: OpenDevice, data: Buffer): void {
    if (!this.window || this.window.isDestroyed()) return;

    // Measure main-process send timing
    const now = performance.now();
    if (this._fwdLastTime > 0) {
      const gap = now - this._fwdLastTime;
      if (gap > this._fwdGapMax) this._fwdGapMax = gap;
      if (gap < 1) this._fwdBursts++;
    }
    this._fwdLastTime = now;
    this._fwdCount++;
    if (now - this._fwdLogTime > 2000 && this._fwdCount > 0) {
      const msg = `[HID-MAIN] sent=${this._fwdCount} maxGap=${this._fwdGapMax.toFixed(1)}ms bursts=${this._fwdBursts}`;
      // Send to renderer diag UI only (no terminal log)
      this.send('hid:main-perf', msg);
      this._fwdCount = 0;
      this._fwdGapMax = 0;
      this._fwdBursts = 0;
      this._fwdLogTime = now;
    }

    // Send buffer directly — Electron serializes Buffer/Uint8Array efficiently
    this.window.webContents.send('hid:report', dev.key, dev.vid, dev.pid, data);
  }

  private removeDevice(dev: OpenDevice): void {
    try { dev.hid.close(); } catch { /* ignore */ }
    this.devices = this.devices.filter(d => d !== dev);
  }

  /** Write raw data to an open HID device (for haptics, LED, etc.)
   *  On Windows, node-hid requires the buffer to match the HID output report size.
   *  For Switch controllers this is 64 bytes. Data is zero-padded as needed. */
  write(deviceKey: string, data: number[]): boolean {
    const dev = this.devices.find(d => d.key === deviceKey);
    if (!dev) return false;
    if (dev.writeFailed) return false; // Suppress repeated writes to devices that don't support output
    try {
      const buf = new Array(64).fill(0);
      for (let i = 0; i < Math.min(data.length, 64); i++) buf[i] = data[i];
      dev.hid.pause();
      dev.hid.write(buf);
      dev.hid.resume();
      return true;
    } catch (err) {
      dev.hid.resume();
      if (!dev.writeFailed) {
        dev.writeFailed = true;
        this.log(`Write error ${deviceKey}: ${(err as Error).message} (suppressing further writes)`);
      }
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
   * Vibrate with a pattern: array of {durationMs, intensity} segments with gaps between.
   * Writes happen in a Worker thread so the main process is never blocked.
   */
  vibratePattern(deviceKey: string, pattern: { durationMs: number; intensity: number }[], gapMs: number = 0): { ok: boolean; error?: string } {
    const dev = this.devices.find(d => d.key === deviceKey);
    if (!dev) {
      const msg = `Device not found: "${deviceKey}" (available: ${this.devices.map(d => d.key).join(', ') || 'none'})`;
      this.log(msg);
      this.send('hid:error', { deviceKey, error: msg });
      return { ok: false, error: msg };
    }

    // Build all frames up front
    const frames: number[][] = [];
    const gapFrames = Math.max(0, Math.ceil(gapMs / 4));

    for (let s = 0; s < pattern.length; s++) {
      const seg = pattern[s];
      const clamped = Math.max(0, Math.min(1, seg.intensity));
      const haptic = clamped >= 0.7 ? HidInputReader.HAPTIC_STRONG
        : clamped >= 0.3 ? HidInputReader.HAPTIC_MEDIUM
        : HidInputReader.HAPTIC_LIGHT;
      const count = Math.max(1, Math.ceil(seg.durationMs / 4));
      for (let i = 0; i < count; i++) frames.push(haptic);
      // Gap between segments
      if (gapFrames > 0 && s < pattern.length - 1) {
        for (let i = 0; i < gapFrames; i++) frames.push(HidInputReader.HAPTIC_SILENT);
      }
    }
    frames.push(HidInputReader.HAPTIC_SILENT); // end with silence

    // Use worker thread for non-blocking writes
    this.log(`vibratePattern: dispatching ${frames.length} frames to worker for ${deviceKey} path=${dev.path}`);
    this.workerRequest({ type: 'vibrate', devicePath: dev.path, frames })
      .then((result: any) => {
        this.log(`vibratePattern worker result: ${JSON.stringify(result)}`);
        if (!result.ok || result.writeErrors > 0) {
          this.log(`Worker vibrate issue — falling back to direct write`);
          this.writeFramesDirect(dev, frames);
        }
      })
      .catch((err: Error) => {
        this.log(`vibratePattern worker error: ${err.message} — falling back to direct write`);
        this.writeFramesDirect(dev, frames);
      });
    return { ok: true };
  }

  /**
   * Test vibration: sends the full procon2tool haptic pattern in a Worker thread.
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

    this.writeFramesDirect(dev, pattern);
    return { ok: true, frames: pattern.length, errors: 0, writeMs: 0 };
  }

  /** Write haptic frames directly from the reader handle (pause → write → resume). */
  private writeFramesDirect(dev: OpenDevice, frames: number[][]): void {
    dev.hid.pause();
    let counter = 0;
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
      } catch { /* device may have disconnected */ }
      counter = (counter + 1) & 0x0F;
    }
    dev.hid.resume();
  }

  private send(channel: string, data: unknown): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.webContents.send(channel, data);
    }
  }
}

/** Singleton instance */
export const hidInputReader = new HidInputReader();
