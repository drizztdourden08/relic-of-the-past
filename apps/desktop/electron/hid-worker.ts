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
  console.log(`[HID-WORKER] vibrate: path=${devicePath}, frames=${frames.length}`);
  try {
    const dev = new HID.HID(devicePath);
    console.log(`[HID-WORKER] opened device OK`);
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
        if (writeErrors === 1) console.log(`[HID-WORKER] first write error: ${writeErr?.message}`);
      }
      counter = (counter + 1) & 0x0F;
    }
    dev.close();
    console.log(`[HID-WORKER] done: ${frames.length} frames, ${writeErrors} errors`);
    parentPort!.postMessage({ id, ok: true, frames: frames.length, writeErrors });
  } catch (err: any) {
    console.log(`[HID-WORKER] open/fatal error: ${err?.message}`);
    parentPort!.postMessage({ id, ok: false, error: err?.message ?? 'vibrate failed' });
  }
}
