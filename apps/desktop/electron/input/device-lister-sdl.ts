/* @layer electron-main @kind logic */
/**
 * DeviceLister backed by the SDL3 addon's `enumerateHid()` — it tags bus
 * type itself and lists every device it currently cannot claim (held open
 * elsewhere, or filtered by SDL's own hidapi rules), so this is the sole
 * source for the device snapshot. See device-lister.ts for the selection.
 */
import { enumerateHid } from './native/sdl3';
import type { ListedDevice } from './device-lister.type';

const listDevicesViaSdl = (): ListedDevice[] =>
  enumerateHid().map((device) => ({
    vendorId: device.vendorId,
    productId: device.productId,
    product: device.productString || 'Unknown Controller',
    busType: device.busType,
  }));

export { listDevicesViaSdl };
