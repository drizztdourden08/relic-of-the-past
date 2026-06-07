/* @layer electron-main @kind logic */
/** Device scan + open/connect loop for HidInputReader (operates on the instance). */
import HID from 'node-hid';
import { sendUsbInit } from './usb-init';
import type { OpenDevice } from './hid-constants';
import { NINTENDO_VID, NINTENDO_PIDS, toHex4 } from './hid-constants';
import { filterGamepadCandidates, groupByVidPid, selectBestInterface } from './hid-discovery';
import { buildSilentFrame } from './hid-haptics';
import type { HidInputReader } from './hid-reader';

const scanAndOpenReader = async (reader: HidInputReader): Promise<void> => {
  let allDevices: HID.Device[];
  try {
    allDevices = await reader.enumerateDevicesAsync();
  } catch {
    return;
  }

  const candidates = filterGamepadCandidates(allDevices);
  const groups = groupByVidPid(candidates);

  // Remove devices that disappeared from enumeration (unplugged)
  const enumeratedKeys = new Set(groups.keys());
  for (const dev of [...reader.devices]) {
    if (!enumeratedKeys.has(dev.key)) {
      reader.log(`Device ${dev.key} (${dev.product}) no longer enumerated — removing`);
      reader.removeDevice(dev);
      reader.send('hid:disconnect', { deviceKey: dev.key, product: dev.product });
    }
  }

  for (const [key, interfaces] of groups) {
    if (reader.devices.some(d => d.key === key)) continue;

    const target = selectBestInterface(interfaces);
    if (!target || !target.path) continue;

    reader.log(`Opening ${key} (${target.product || 'Unknown'}) usagePage=0x${(target.usagePage ?? 0).toString(16)} usage=0x${(target.usage ?? 0).toString(16)}`);

    try {
      if (target.vendorId === NINTENDO_VID && NINTENDO_PIDS.has(target.productId)) {
        try {
          const ok = await sendUsbInit(target.vendorId, target.productId);
          if (ok) reader.log(`USB init succeeded for ${key}`);
        } catch (err) {
          reader.log(`USB init attempt for ${key}: ${(err as Error).message}`);
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
      reader.devices.push(dev);

      hid.on('data', (data: Buffer) => reader.forwardReport(dev, data));
      hid.on('error', (err: Error) => {
        reader.log(`Device error ${key}: ${err.message}`);
        reader.removeDevice(dev);
        reader.send('hid:disconnect', { deviceKey: key, product: dev.product, error: err.message });
      });

      reader.log(`Opened ${key} (${dev.product})`);

      // SPC2 wake-up haptic poke
      if (target.vendorId === NINTENDO_VID && target.productId === 0x2069) {
        try {
          const wake = buildSilentFrame(0x50);
          hid.pause();
          try {
            hid.write(wake);
            reader.log(`Sent wake-up haptic frame to ${key}`);
          } finally {
            hid.resume();
          }
        } catch (err) {
          reader.log(`Wake-up write failed for ${key}: ${(err as Error).message}`);
        }
      }

      reader.send('hid:device-opened', {
        deviceKey: key,
        vendorId: toHex4(target.vendorId),
        productId: toHex4(target.productId),
        product: dev.product,
      });
    } catch (err) {
      reader.log(`Failed to open ${key}: ${(err as Error).message}`);
    }
  }
};

export { scanAndOpenReader };
