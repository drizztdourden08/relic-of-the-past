/* @layer electron-main @kind logic */
/**
 * Persistent HID Worker Thread
 *
 * Handles all blocking HID operations off the main thread:
 *  - Device enumeration (HID.devices() blocks ~180ms on Windows)
 *  - Haptic frame writes (blocking synchronous I/O)
 *
 * Communicates with the main thread via postMessage.
 */
import { parentPort } from 'worker_threads';
import HID from 'node-hid';
import type { WorkerRequest } from './hid-worker-protocol';

/** Blocking sleep for inter-frame pacing (safe in worker threads). */
const sleepSab = new SharedArrayBuffer(4);
const sleepView = new Int32Array(sleepSab);
const sleepMs = (ms: number): void => {
  Atomics.wait(sleepView, 0, 0, ms);
};

/** Frame interval in ms — SPC2 haptic endpoint runs at ~250Hz */
const FRAME_INTERVAL_MS = 5;

parentPort!.on('message', (msg: WorkerRequest) => {
  switch (msg.type) {
    case 'enumerate':
      handleEnumerate(msg.id);
      break;
    case 'vibrate':
      handleVibrate(msg.id, msg.devicePath, msg.frames);
      break;
  }
});

const handleEnumerate = (id: number): void => {
  try {
    const devices = HID.devices();
    parentPort!.postMessage({ id, ok: true, devices });
  } catch (err: any) {
    parentPort!.postMessage({ id, ok: false, error: err?.message ?? 'enumerate failed' });
  }
};

const handleVibrate = (id: number, devicePath: string, frames: number[][]): void => {
  parentPort!.postMessage({ type: 'log', msg: `vibrate: path=${devicePath}, frames=${frames.length}` });
  try {
    const dev = new HID.HID(devicePath);
    parentPort!.postMessage({ type: 'log', msg: `opened device OK` });
    let counter = 0;
    let writeErrors = 0;
    for (const haptic of frames) {
      const buf = new Array(64).fill(0);
      buf[0] = 0x02;
      buf[1] = 0x50 | (counter & 0x0F);
      buf[17] = buf[1];
      for (let j = 0; j < haptic.length; j++) {
        buf[2 + j] = haptic[j];
        buf[18 + j] = haptic[j];
      }
      try {
        dev.write(buf);
      } catch (writeErr: any) {
        writeErrors++;
        if (writeErrors === 1) parentPort!.postMessage({ type: 'log', msg: `first write error: ${writeErr?.message}` });
      }
      counter = (counter + 1) & 0x0F;
      sleepMs(FRAME_INTERVAL_MS);
    }
    dev.close();
    parentPort!.postMessage({ type: 'log', msg: `done: ${frames.length} frames, ${writeErrors} errors` });
    parentPort!.postMessage({ id, ok: true, frames: frames.length, writeErrors });
  } catch (err: any) {
    parentPort!.postMessage({ type: 'log', msg: `open/fatal error: ${err?.message}` });
    parentPort!.postMessage({ id, ok: false, error: err?.message ?? 'vibrate failed' });
  }
};
