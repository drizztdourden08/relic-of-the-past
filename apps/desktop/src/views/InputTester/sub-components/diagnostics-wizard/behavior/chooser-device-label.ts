/* @layer renderer-components @kind logic */
import type { ChooserDevice, NameLookupParams } from '../diagnostics-wizard.type';

const chooserDeviceLabel = (device: ChooserDevice, addedNames: (params: NameLookupParams) => string | null): string => {
  if (device.name) return device.name;
  const added = addedNames({ deviceKey: device.deviceKey, vendorId: device.vendorId, productId: device.productId });
  if (added) return added;
  if (device.product) return device.product;
  return device.deviceKey;
};

export { chooserDeviceLabel };
