/* @layer electron-main @kind logic */
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
import type { BrowserWindow } from 'electron';
import { Worker } from 'worker_threads';
import path from 'path';
import { sendUsbInit } from './usb-init';
import type { OpenDevice } from './hid-constants';
import { NINTENDO_VID, NINTENDO_PIDS, toHex4 } from './hid-constants';
import { filterGamepadCandidates, groupByVidPid, selectBestInterface } from './hid-discovery';
import { buildSegmentFrames, buildPatternFrames, writeFramesDirect, buildSilentFrame } from './hid-haptics';

class HidInputReader {
  private devices: OpenDevice[] = [];
  private scanInterval: ReturnType<typeof setInterval> | null = null;
  private window: BrowserWindow | null = null;
  private worker: Worker | null = null;
  private workerReqId = 0;
  private workerCallbacks = new Map<number, (result: any) => void>();

  // ── Main-process send timing ──
  private _fwdLastTime = 0;
  private _fwdGapMax = 0;
  private _fwdBursts = 0;
  private _fwdCount = 0;
  private _fwdLogTime = 0;

  /** Start scanning for controllers and reading input. */
  start(win: BrowserWindow): void {
    this.window = win;
    this.log(`HID input reader starting...`);
    this.scanAndOpen();
    this.scanInterval = setInterval(() => this.scanAndOpen(), 3000);
  }

  /** Stop all readers and close devices. Sends SILENT haptic frame before closing. */
  stop(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    if (this.worker) {
      this.worker.terminate().catch(() => {});
      this.worker = null;
      this.workerCallbacks.clear();
    }
    for (const dev of this.devices) {
      try {
        const buf = buildSilentFrame(0x50);
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

  /** Write raw data to an open HID device (for haptics, LED, etc.) */
  write(deviceKey: string, data: number[]): boolean {
    const dev = this.devices.find(d => d.key === deviceKey);
    if (!dev) return false;
    if (dev.writeFailed) return false;
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

  /** Vibrate an HID controller for a given duration and intensity. */
  vibrate(deviceKey: string, durationMs: number, intensity: number): boolean {
    const dev = this.devices.find(d => d.key === deviceKey);
    if (!dev) return false;
    const frames = buildSegmentFrames(durationMs, intensity);
    writeFramesDirect(dev, frames);
    return true;
  }

  /** Vibrate with a pattern: array of {durationMs, intensity} segments with gaps. */
  vibratePattern(deviceKey: string, pattern: { durationMs: number; intensity: number }[], gapMs: number = 0): { ok: boolean; error?: string } {
    const dev = this.devices.find(d => d.key === deviceKey);
    if (!dev) {
      const msg = `Device not found: "${deviceKey}" (available: ${this.devices.map(d => d.key).join(', ') || 'none'})`;
      this.log(msg);
      this.send('hid:error', { deviceKey, error: msg });
      return { ok: false, error: msg };
    }

    const frames = buildPatternFrames(pattern, gapMs);
    this.log(`vibratePattern: dispatching ${frames.length} frames to worker for ${deviceKey} path=${dev.path}`);
    this.workerRequest({ type: 'vibrate', devicePath: dev.path, frames })
      .then((result: any) => {
        this.log(`vibratePattern worker result: ${JSON.stringify(result)}`);
        if (!result.ok || result.writeErrors > 0) {
          this.log(`Worker vibrate issue — falling back to direct write`);
          writeFramesDirect(dev, frames);
        }
      })
      .catch((err: Error) => {
        this.log(`vibratePattern worker error: ${err.message} — falling back to direct write`);
        writeFramesDirect(dev, frames);
      });
    return { ok: true };
  }

  // ── Worker thread management ──

  private ensureWorker(): Worker {
    if (!this.worker) {
      const workerPath = path.join(__dirname, 'hid-worker.js');
      this.worker = new Worker(workerPath);
      this.worker.on('message', (msg: { id?: number; type?: string; msg?: string; [k: string]: any }) => {
        if (msg.type === 'log') {
          this.log(`[worker] ${msg.msg}`);
          return;
        }
        const cb = this.workerCallbacks.get(msg.id!);
        if (cb) {
          this.workerCallbacks.delete(msg.id!);
          cb(msg);
        }
      });
      this.worker.on('error', (err) => {
        this.log(`HID worker error: ${err.message}`);
      });
    }
    return this.worker;
  }

  private workerRequest<T = any>(msg: Record<string, any>): Promise<T> {
    const id = ++this.workerReqId;
    const w = this.ensureWorker();
    return new Promise<T>((resolve) => {
      this.workerCallbacks.set(id, resolve);
      w.postMessage({ ...msg, id });
    });
  }

  async enumerateDevicesAsync(): Promise<HID.Device[]> {
    const result = await this.workerRequest<{ ok: boolean; devices?: HID.Device[]; error?: string }>({ type: 'enumerate' });
    if (result.ok && result.devices) return result.devices;
    throw new Error(result.error ?? 'enumerate failed');
  }

  // ── Device scanning & connection ──

  private async scanAndOpen(): Promise<void> {
    let allDevices: HID.Device[];
    try {
      allDevices = await this.enumerateDevicesAsync();
    } catch {
      return;
    }

    const candidates = filterGamepadCandidates(allDevices);
    const groups = groupByVidPid(candidates);

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
      if (this.devices.some(d => d.key === key)) continue;

      const target = selectBestInterface(interfaces);
      if (!target || !target.path) continue;

      this.log(`Opening ${key} (${target.product || 'Unknown'}) usagePage=0x${(target.usagePage ?? 0).toString(16)} usage=0x${(target.usage ?? 0).toString(16)}`);

      try {
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

        hid.on('data', (data: Buffer) => this.forwardReport(dev, data));
        hid.on('error', (err: Error) => {
          this.log(`Device error ${key}: ${err.message}`);
          this.removeDevice(dev);
          this.send('hid:disconnect', { deviceKey: key, product: dev.product, error: err.message });
        });

        this.log(`Opened ${key} (${dev.product})`);

        // SPC2 wake-up haptic poke
        if (target.vendorId === NINTENDO_VID && target.productId === 0x2069) {
          try {
            const wake = buildSilentFrame(0x50);
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

  // ── Report forwarding ──

  private forwardReport(dev: OpenDevice, data: Buffer): void {
    if (!this.window || this.window.isDestroyed()) return;

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
      this.send('hid:main-perf', msg);
      this._fwdCount = 0;
      this._fwdGapMax = 0;
      this._fwdBursts = 0;
      this._fwdLogTime = now;
    }

    this.window.webContents.send('hid:report', dev.key, dev.vid, dev.pid, data);
  }

  // ── Utilities ──

  private removeDevice(dev: OpenDevice): void {
    try { dev.hid.close(); } catch { /* ignore */ }
    this.devices = this.devices.filter(d => d !== dev);
  }

  private send(channel: string, data: unknown): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.webContents.send(channel, data);
    }
  }

  private log(msg: string): void {
    console.log(`[HID] ${msg}`);
  }
}

/** Singleton instance */
const hidInputReader = new HidInputReader();

export { HidInputReader, hidInputReader };
