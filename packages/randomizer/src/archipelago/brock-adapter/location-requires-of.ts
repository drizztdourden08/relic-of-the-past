/* @layer shared-game @kind logic */
import { isShopSlotLocation } from '../../world/shops/shop-slots';
import { isRotpLocation } from './is-rotp-location';
import type { LocationRequires } from '@drizztdourden08/brock-randomizer/archipelago';
import type { WorldLocation as BaseWorldLocation } from '@drizztdourden08/brock-randomizer/world';
import type { RotpKeys } from '../../world/rotp-keys.type';

const locationRequiresOf = (location: BaseWorldLocation<RotpKeys>): LocationRequires => {
  if (!isRotpLocation(location)) throw new Error(`not a RotP location: ${location.key}`);
  if (isShopSlotLocation(location.key)) return { present: 'shop' };
  return location.pondSlot ? { present: 'pond' } : { always: true };
};

export { locationRequiresOf };
