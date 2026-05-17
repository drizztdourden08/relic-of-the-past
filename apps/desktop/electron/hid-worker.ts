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

interface EnumerateMsg {
  type: 'enumerate';
  id: number;
}

interface VibrateMsg {
  type: 'vibrate';
  id: number;
  devicePath: string;
  frames: number[][];
}

type WorkerMsg = EnumerateMsg | VibrateMsg;

parentPort!.on('message', (msg: WorkerMsg) => {
  switch (msg.type) {
    case 'enumerate':
      handleEnumerate(msg.id);
      break;
    case 'vibrate':
      handleVibrate(msg.id, msg.devicePath, msg.frames);
      break;
  }
});

function handleEnumerate(id: number): void {
  try {
    const devices = HID.devices();
    parentPort!.postMessage({ id, ok: true, devices });
  } catch (err: any) {
    parentPort!.postMessage({ id, ok: false, error: err?.message ?? 'enumerate failed' });
  }
}

function handleVibrate(id: number, devicePath: string, frames: number[][]): void {
  try {
    const dev = new HID.HID(devicePath);
    let counter = 0;
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
      } catch { /* device may have disconnected */ }
      counter = (counter + 1) & 0x0F;
    }
    dev.close();
    parentPort!.postMessage({ id, ok: true, frames: frames.length });
  } catch (err: any) {
    parentPort!.postMessage({ id, ok: false, error: err?.message ?? 'vibrate failed' });
  }
}
