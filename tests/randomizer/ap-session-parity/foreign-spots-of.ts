/* @layer tests @kind helper */
import { isShopSlotLocation } from '@shared/randomizer/world/shops/shop-slots';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';

const foreignSpotsOf = (placement: Placement): LocationKey[] => {
  const keys = Object.keys(placement.locations) as LocationKey[];
  const ponds = keys.filter((key) => key.startsWith('slot-pond-'));
  const shelf = keys.filter((key) => isShopSlotLocation(key)).sort()[0];
  return shelf === undefined ? ponds : [...ponds, shelf];
};

export { foreignSpotsOf };
