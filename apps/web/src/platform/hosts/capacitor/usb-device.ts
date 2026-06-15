/* @layer renderer-other @kind logic */
/**
 * A minimal WebUSB-shaped facade over the native ControllerHid USB channel, so
 * vendor bulk-init presets that drive `navigator.usb` (Switch Pro 2) run unchanged
 * on Android — where WebUSB is absent from the System WebView. Implements only the
 * subset those presets touch: configuration.interfaces[i].alternate.endpoints,
 * selectConfiguration, claimInterface, transferOut/In, close.
 */
import { isControllerHidAvailable, controllerHid } from './controller-hid-plugin';
import type { UsbEndpoint } from './controller-hid-plugin';

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

const toWebEndpoint = (ep: UsbEndpoint) => ({
  endpointNumber: ep.endpointNumber,
  direction: ep.direction,
  type: ep.type,
});

// Builds the device.configuration.interfaces[index].alternate.endpoints tree.
const buildInterfaces = (ifaces: { index: number; endpoints: UsbEndpoint[] }[]) => {
  const max = ifaces.reduce((m, i) => Math.max(m, i.index), -1);
  const arr = Array.from({ length: max + 1 }, () => ({ alternate: { endpoints: [] as ReturnType<typeof toWebEndpoint>[] } }));
  for (const iface of ifaces) arr[iface.index] = { alternate: { endpoints: iface.endpoints.map(toWebEndpoint) } };
  return arr;
};

const createDevice = (handle: number, interfaces: { index: number; endpoints: UsbEndpoint[] }[]) => {
  const plugin = controllerHid();
  return {
    configuration: { interfaces: buildInterfaces(interfaces) },
    selectConfiguration: async () => {},
    claimInterface: async (index: number) => { await plugin.usbClaimInterface({ handle, index }); },
    transferOut: async (endpoint: number, data: Uint8Array) => {
      await plugin.usbTransferOut({ handle, endpoint, data: bytesToBase64(data) });
      return { status: 'ok' as const, bytesWritten: data.length };
    },
    transferIn: async (endpoint: number, length: number) => {
      const r = await plugin.usbTransferIn({ handle, endpoint, length });
      const bytes = Uint8Array.from(atob(r.data), (c) => c.charCodeAt(0));
      return { status: 'ok' as const, data: new DataView(bytes.buffer) };
    },
    close: async () => { await plugin.usbClose({ handle }); },
  };
};

// Returns a WebUSB-shaped device, or null when no native plugin / device.
const openCapacitorUsb = async (vendorId: number, productId: number): Promise<USBDevice | null> => {
  if (!isControllerHidAvailable()) return null;
  try {
    const res = await controllerHid().usbOpen({ vendorId, productId });
    if (res.handle < 0) return null;
    return createDevice(res.handle, res.interfaces) as unknown as USBDevice;
  } catch { return null; }
};

export { openCapacitorUsb };
