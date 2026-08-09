/* @layer renderer-components @kind logic */
/**
 * Best-effort USB-vs-Bluetooth guess from a raw OS HID device path. Windows
 * routes Bluetooth-attached HID devices through the standard Bluetooth HID
 * service UUID (0x1124), which shows up verbatim in the device path — that
 * substring is the one reliable signal available; everything else is a guess.
 * Never treat this as ground truth — it's a hint, the raw path is the truth.
 */
import type { ConnectionHint } from './hid-calibration.type';

const BLUETOOTH_HID_SERVICE_UUID = '00001124-0000-1000-8000-00805f9b34fb';

const guessConnectionHint = (devicePath: string | null): ConnectionHint => {
  if (!devicePath) return 'unknown';
  const path = devicePath.toLowerCase();
  if (path.includes(BLUETOOTH_HID_SERVICE_UUID) || path.includes('bthenum')) return 'bluetooth';
  if (path.includes('hid#vid_') || path.includes('usb')) return 'usb';
  return 'unknown';
};

export { guessConnectionHint };
