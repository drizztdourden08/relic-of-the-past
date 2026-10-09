/* @layer tests @kind helper */
import { isShopSlotLocation } from '@rotp/randomizer';
import type { LocationKey, Placement } from '@rotp/randomizer';

const foreignSpotsOf = (placement: Placement): LocationKey[] => {
  const keys = Object.keys(placement.locations) as LocationKey[];
  const ponds = keys.filter((key) => key.startsWith('slot-pond-'));
  const shelf = keys.filter((key) => isShopSlotLocation(key)).sort()[0];
  return shelf === undefined ? ponds : [...ponds, shelf];
};

export { foreignSpotsOf };
