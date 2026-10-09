/* @layer renderer-components @kind logic */
import type { DeviceEntry, HidListedDevice } from '@shared/ipc';
import type { ChooserDevice } from '../diagnostics-wizard.type';
import { toHex4 } from './to-hex4';

const vidPidKey = (vendorId: number, productId: number): string =>
  `${toHex4(vendorId)}:${toHex4(productId)}`;

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

export { buildChooserDevices };
export type { ChooserDevice };
