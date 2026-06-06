/**
 * Nintendo Switch 2 Controller USB Initialization
 *
 * NSO GameCube (0x2073) and Switch Pro Controller 2 (0x2069) require
 * USB bulk commands on interface 1 to start HID input report streaming.
 *
 * After these commands, the controller auto-streams at 4ms intervals on
 * the HID interface (interface 0) which node-hid reads.
 *
 * Reference: procon2tool (HandHeldLegend), NSO-GameCube-Controller-Pairing-App
 */

import type { Interface, OutEndpoint } from 'usb';
import { findByIds } from 'usb';

const NINTENDO_VID = 0x057e;

// PIDs that need USB init
const NEEDS_USB_INIT = new Set([
  0x2069, // Switch Pro Controller 2
  0x2073, // NSO GameCube Controller
]);

// USB interface number for vendor-specific bulk endpoint
const USB_INIT_INTERFACE = 1;

// Bulk OUT endpoint address on interface 1
const BULK_OUT_EP = 0x02;

/**
 * Enable HID Output — command 0x03
 * Tells the controller to start streaming input reports at 4ms intervals.
 * Bytes 10-15: Console MAC (all 0xFF = generic/unpaired mode)
 */
const ENABLE_HID_OUTPUT = Buffer.from([
  0x03, 0x91, 0x00, 0x0d, 0x00, 0x08,
  0x00, 0x00, 0x01, 0x00,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
]);

/**
 * Enable Haptics — command 0x03, arg 0x0a
 * Enables HID output report processing for haptic feedback (report ID 0x02).
 * Without this, the controller silently ignores haptic writes.
 * Reference: procon2tool step 14
 */
const ENABLE_HAPTICS = Buffer.from([
  0x03, 0x91, 0x00, 0x0a, 0x00, 0x04,
  0x00, 0x00, 0x09, 0x00, 0x00, 0x00,
]);

/**
 * Set Player LED — command 0x09
 * Confirms connection and sets player indicator LED.
 * Byte 8: LED mask (0x01 = player 1)
 */
const SET_PLAYER_LED = Buffer.from([
  0x09, 0x91, 0x00, 0x07, 0x00, 0x08,
  0x00, 0x00, 0x01, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00,
]);

function log(msg: string): void {
  console.log(`[USB-INIT] ${msg}`);
}

function transferOut(endpoint: OutEndpoint, data: Buffer): Promise<void> {
  return new Promise((resolve, reject) => {
    endpoint.transfer(data, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Send USB init commands to a Nintendo controller to start HID streaming.
 * Returns true if commands were sent successfully.
 */
async function sendUsbInit(vid: number, pid: number): Promise<boolean> {
  if (vid !== NINTENDO_VID || !NEEDS_USB_INIT.has(pid)) {
    return false;
  }

  const device = findByIds(vid, pid);
  if (!device) {
    log(`Device ${vid.toString(16)}:${pid.toString(16)} not found via libusb`);
    return false;
  }

  try {
    device.open();
    log(`Opened USB device ${vid.toString(16)}:${pid.toString(16)}`);

    let iface: Interface;
    try {
      iface = device.interface(USB_INIT_INTERFACE);
    } catch (err) {
      log(`Interface ${USB_INIT_INTERFACE} not available: ${(err as Error).message}`);
      device.close();
      return false;
    }

    try {
      iface.claim();
      log(`Claimed interface ${USB_INIT_INTERFACE}`);
    } catch (err) {
      log(`Failed to claim interface ${USB_INIT_INTERFACE}: ${(err as Error).message}`);
      device.close();
      return false;
    }

    // Get the bulk OUT endpoint
    const outEp = iface.endpoint(BULK_OUT_EP) as OutEndpoint | undefined;
    if (!outEp || outEp.direction !== 'out') {
      log(`Bulk OUT endpoint 0x${BULK_OUT_EP.toString(16)} not found`);
      await releaseAndClose(iface, device);
      return false;
    }

    // Send init sequence
    await transferOut(outEp, ENABLE_HID_OUTPUT);
    log(`Sent ENABLE_HID_OUTPUT to ${vid.toString(16)}:${pid.toString(16)}`);

    await sleep(15);

    await transferOut(outEp, ENABLE_HAPTICS);
    log(`Sent ENABLE_HAPTICS to ${vid.toString(16)}:${pid.toString(16)}`);

    await sleep(15);

    await transferOut(outEp, SET_PLAYER_LED);
    log(`Sent SET_PLAYER_LED to ${vid.toString(16)}:${pid.toString(16)}`);

    // Release interface so node-hid can read from interface 0 without conflict
    await releaseAndClose(iface, device);
    log(`Init complete for ${vid.toString(16)}:${pid.toString(16)}`);
    return true;
  } catch (err) {
    log(`USB init error: ${(err as Error).message}`);
    try { device.close(); } catch { /* ignore */ }
    return false;
  }
}

async function releaseAndClose(iface: Interface, device: ReturnType<typeof findByIds>): Promise<void> {
  await new Promise<void>((resolve) => {
    iface.release(true, () => resolve());
  });
  device!.close();
}

/**
 * Run USB init for all connected Nintendo controllers that need it.
 */
async function initAllNintendoControllers(): Promise<void> {
  for (const pid of NEEDS_USB_INIT) {
    try {
      await sendUsbInit(NINTENDO_VID, pid);
    } catch (err) {
      log(`Init failed for PID ${pid.toString(16)}: ${(err as Error).message}`);
    }
  }
}

export { initAllNintendoControllers, sendUsbInit };
