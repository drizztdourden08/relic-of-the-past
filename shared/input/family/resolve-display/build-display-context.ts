/* @layer shared-input @kind logic */
import { findFamily } from '../family-registry';
import { GENERIC_FAMILY } from '../generic.family';
import type { DeviceOverride } from '../family.type';
import type { DisplayContext, DisplayContextParams } from './resolve-display.type';

const findOverride = (
  overrides: readonly DeviceOverride[],
  vendorId: string | undefined,
  productId: string | undefined,
): DeviceOverride | null => {
  if (!vendorId || !productId) return null;
  return overrides.find(entry => entry.vendorId === vendorId && entry.productId === productId) ?? null;
};

const buildDisplayContext = (params: DisplayContextParams): DisplayContext => {
  const { sdlType, vendorId, productId, overrides = [] } = params;
  return {
    override: findOverride(overrides, vendorId, productId),
    family: findFamily(sdlType),
    generic: GENERIC_FAMILY,
  };
};

export { buildDisplayContext };
