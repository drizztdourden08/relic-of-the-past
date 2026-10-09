/* @layer electron-main @kind logic */
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
