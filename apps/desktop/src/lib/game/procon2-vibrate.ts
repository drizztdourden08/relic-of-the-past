/**
 * Exact procon2tool replication — WebUSB bulk init + WebHID haptic output.
 * This is a standalone module with zero dependencies on our codebase.
 * Matches procon2tool's connectUsb() + sendHaptics() flow exactly.
 */

// procon2tool constants
const VENDOR_ID = 0x057E;
const PRODUCT_ID = 0x2069;
const USB_INTERFACE = 1;

// procon2tool init commands (bulk OUT on interface 1)
const INIT_COMMAND_0x03 = new Uint8Array([
  0x03, 0x91, 0x00, 0x0d, 0x00, 0x08,
  0x00, 0x00, 0x01, 0x00,
  0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF
]);

const ENABLE_HAPTICS = new Uint8Array([
  0x03, 0x91, 0x00, 0x0a, 0x00, 0x04,
  0x00, 0x00, 0x09,
  0x00, 0x00, 0x00
]);

// procon2tool haptic data (report 0x02)
const HAPTIC_STRONG = [0x93, 0x35, 0x36, 0x1c, 0x0d];
const HAPTIC_SILENT = [0x3f, 0x01, 0xf0, 0x19, 0x00];

export interface Procon2Result {
  step: string;
  ok: boolean;
  error?: string;
  details?: any;
}

/** Promise that rejects after ms */
function timeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timeout (${ms}ms)`)), ms))
  ]);
}

/**
 * Run the full procon2tool flow:
 * 1. WebUSB: open → selectConfiguration → claimInterface(1) → bulk transferOut
 * 2. WebHID: open → sendReport(0x02, hapticFrames)
 */
export async function procon2Vibrate(): Promise<Procon2Result[]> {
  const results: Procon2Result[] = [];

  // ── Phase 1: WebUSB bulk init ──
  let usbDevice: USBDevice | null = null;
  let bulkEndpoint: number | null = null;

  try {
    usbDevice = await timeout(
      navigator.usb.requestDevice({ filters: [{ vendorId: VENDOR_ID, productId: PRODUCT_ID }] }),
      5000, 'usb.requestDevice'
    );
    results.push({ step: 'usb.requestDevice', ok: true });
  } catch (e: any) {
    results.push({ step: 'usb.requestDevice', ok: false, error: e.message });
    return results;
  }

  try {
    await usbDevice.open();
    results.push({ step: 'usb.open', ok: true });
  } catch (e: any) {
    results.push({ step: 'usb.open', ok: false, error: e.message });
    return results;
  }

  try {
    if (!usbDevice.configuration) {
      await usbDevice.selectConfiguration(1);
    }
    results.push({ step: 'usb.selectConfiguration', ok: true, details: { configValue: usbDevice.configuration?.configurationValue } });
  } catch (e: any) {
    results.push({ step: 'usb.selectConfiguration', ok: false, error: e.message });
    return results;
  }

  try {
    await usbDevice.claimInterface(USB_INTERFACE);
    results.push({ step: 'usb.claimInterface(1)', ok: true });
  } catch (e: any) {
    results.push({ step: 'usb.claimInterface(1)', ok: false, error: e.message });
    // Don't return — still try WebHID below
  }

  // Find bulk OUT endpoint
  if (results[results.length - 1].ok) {
    try {
      const iface = usbDevice.configuration!.interfaces[USB_INTERFACE];
      const epOut = iface.alternate.endpoints.find(
        ep => ep.direction === 'out' && ep.type === 'bulk'
      );
      if (!epOut) throw new Error('no bulk OUT endpoint');
      bulkEndpoint = epOut.endpointNumber;
      results.push({ step: 'usb.findEndpoint', ok: true, details: { endpoint: bulkEndpoint } });
    } catch (e: any) {
      results.push({ step: 'usb.findEndpoint', ok: false, error: e.message });
    }
  }

  // Send bulk init commands
  if (bulkEndpoint !== null) {
    try {
      await usbDevice.transferOut(bulkEndpoint, INIT_COMMAND_0x03);
      await new Promise(r => setTimeout(r, 50));
      await usbDevice.transferOut(bulkEndpoint, ENABLE_HAPTICS);
      await new Promise(r => setTimeout(r, 50));
      results.push({ step: 'usb.bulkInit', ok: true });
    } catch (e: any) {
      results.push({ step: 'usb.bulkInit', ok: false, error: e.message });
    }
  }

  // ── Phase 2: WebHID haptic output ──
  let hidDevice: HIDDevice | null = null;

  try {
    const devices = await timeout(
      navigator.hid.requestDevice({ filters: [{ vendorId: VENDOR_ID, productId: PRODUCT_ID }] }),
      5000, 'hid.requestDevice'
    );
    if (devices.length === 0) throw new Error('no device returned');
    hidDevice = devices[0];
    results.push({ step: 'hid.requestDevice', ok: true });
  } catch (e: any) {
    results.push({ step: 'hid.requestDevice', ok: false, error: e.message });
    return results;
  }

  try {
    if (!hidDevice.opened) await hidDevice.open();
    results.push({ step: 'hid.open', ok: true });
  } catch (e: any) {
    results.push({ step: 'hid.open', ok: false, error: e.message });
    return results;
  }

  // Send haptic frames (procon2tool format)
  try {
    let counter = 0;
    let errors = 0;

    // 25 strong frames (~100ms vibration)
    for (let i = 0; i < 25; i++) {
      const buf = new Uint8Array(63);
      buf[0] = 0x50 | (counter & 0x0F);
      buf[16] = buf[0];
      for (let j = 0; j < 5; j++) {
        buf[1 + j] = HAPTIC_STRONG[j];
        buf[17 + j] = HAPTIC_STRONG[j];
      }
      try {
        await hidDevice.sendReport(0x02, buf);
      } catch { errors++; }
      counter = (counter + 1) & 0x0F;
      await new Promise(r => setTimeout(r, 4));
    }

    // 2 silent frames to stop
    for (let i = 0; i < 2; i++) {
      const buf = new Uint8Array(63);
      buf[0] = 0x50 | (counter & 0x0F);
      buf[16] = buf[0];
      for (let j = 0; j < 5; j++) {
        buf[1 + j] = HAPTIC_SILENT[j];
        buf[17 + j] = HAPTIC_SILENT[j];
      }
      try {
        await hidDevice.sendReport(0x02, buf);
      } catch { errors++; }
      counter = (counter + 1) & 0x0F;
      await new Promise(r => setTimeout(r, 4));
    }

    results.push({ step: 'hid.sendHaptics', ok: errors === 0, details: { frames: 27, errors } });
  } catch (e: any) {
    results.push({ step: 'hid.sendHaptics', ok: false, error: e.message });
  }

  return results;
}

// Expose for Playwright
if (typeof window !== 'undefined') {
  (window as any).__procon2Vibrate = procon2Vibrate;
}
