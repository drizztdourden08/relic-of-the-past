/* @layer renderer-components @kind logic */
/**
 * Step 2's device list is the union of two sources, because neither alone is
 * honest about what is connected:
 *  - the raw HID enumeration (see HidListedDevice), which works while SDL's
 *    gamepad backend is released (step 1 onward), but a controller read
 *    through XInput and not HID (most Xbox-style pads) never appears
 *    here at all;
 *  - the SDL-claimed snapshot taken BEFORE step 1 releases the hold, the
 *    only source that ever sees an XInput-only pad, since SDL's own gamepad
 *    backend claims those independently of HID.
 * Byte capability is derived structurally from membership in the first list,
 * never from a vendor/product id: present there means a raw HID open can
 * reach the device, absent means it cannot.
 */
import type { DeviceEntry, HidListedDevice } from '@shared/ipc';

interface ChooserDevice {
  deviceKey: string;
  vendorId: number;
  productId: number;
  /** Present only for a device the controller layer had claimed before the
   *  run released it. The raw enumeration reports no name of its own. */
  name?: string;
  /** Captured before the run released the hold; the mapping table cannot be
   *  queried while the gamepad subsystem is down. */
  mapping?: string;
  product: string;
  busType: DeviceEntry['busType'];
  hasByteCapability: boolean;
  sdlId?: number;
  guid?: string;
  hasGyro?: boolean;
  hasRumble?: boolean;
}

const vidPidKey = (vendorId: number, productId: number): string =>
  `${vendorId.toString(16).padStart(4, '0')}:${productId.toString(16).padStart(4, '0')}`;

const buildChooserDevices = (
  hidListed: readonly HidListedDevice[],
  preReleaseReady: readonly DeviceEntry[],
): ChooserDevice[] => {
  const hidKeys = new Set(hidListed.map((d) => vidPidKey(d.vendorId, d.productId)));
  const byKey = new Map<string, ChooserDevice>();

  for (const d of hidListed) {
    const key = vidPidKey(d.vendorId, d.productId);
    byKey.set(key, {
      deviceKey: key, vendorId: d.vendorId, productId: d.productId,
      product: d.product, busType: d.busType, hasByteCapability: true,
    });
  }

  for (const d of preReleaseReady) {
    const key = vidPidKey(d.vendorId, d.productId);
    const existing = byKey.get(key);
    byKey.set(key, {
      deviceKey: d.deviceKey, vendorId: d.vendorId, productId: d.productId,
      name: d.name || existing?.name,
      mapping: d.mapping || existing?.mapping,
      product: d.product || existing?.product || '', busType: d.busType,
      hasByteCapability: hidKeys.has(key),
      sdlId: d.sdlId, guid: d.guid, hasGyro: d.hasGyro, hasRumble: d.hasRumble,
    });
  }

  return Array.from(byKey.values());
};

export { buildChooserDevices, vidPidKey };
export type { ChooserDevice };
