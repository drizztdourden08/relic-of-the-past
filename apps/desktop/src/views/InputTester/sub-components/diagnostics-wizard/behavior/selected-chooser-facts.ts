/* @layer renderer-components @kind logic */
import type { ChooserDevice } from '../diagnostics-wizard.type';
import { toHex4 } from './to-hex4';

const selectedChooserFacts = (chooser: ChooserDevice | null) => ({
  hasByteCapability: chooser?.hasByteCapability ?? true,
  guid: chooser?.guid,
  mapping: chooser?.mapping,
  sdlId: chooser?.sdlId,
  hasGyro: chooser?.hasGyro ?? false,
  vendorIdHex: chooser ? toHex4(chooser.vendorId) : null,
  productIdHex: chooser ? toHex4(chooser.productId) : null,
});

export { selectedChooserFacts };
