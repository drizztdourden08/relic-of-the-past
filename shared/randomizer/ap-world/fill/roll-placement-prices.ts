/* @layer shared-game @kind logic */
/**
 * What the shelves charge, rolled BEFORE the world is built, because the
 * access rules read these amounts back: a shelf the file could never pay for
 * is out of logic, and the fill has to know that before it places anything.
 *
 * The roll runs on the attempt's own rng, exactly as it always has, so a
 * retry rolls fresh prices and no stored seed moves.
 *
 * The pond demands used to roll here too, on the same stream. They now come
 * from the SEED alone (pond/pond-demand-seed.ts) so the options panel can show
 * them before anything is generated, and so a retry never moves what the
 * profile already settled. A pond asking for rupees and nothing else drew
 * nothing from this stream, so the move leaves every placement where it was.
 */
import { REFERENCE_CAPACITY_PROFILE } from '../capacity/capacity-profile-defaults';
import { NO_SHOP_SCOPE } from '../shops/shop-scope-from-values';
import { rollShopPrices, shopPricePlanOf } from '../shops/shop-price-plan';
import { shopSlotLocationsOf } from '../shops/shop-slots';
import type { ApOptionValue } from '../options.type';
import type { FillWorldOptions } from './fill-world.type';
import type { Rng } from '../../rng';
import type { ShopPriceView } from '../shops/shop-price.type';

interface RollInput {
  values: Readonly<Record<string, ApOptionValue>>;
  options: FillWorldOptions;
  rng: Rng;
}

const rollPrices = (input: RollInput): ShopPriceView => {
  const { values, options, rng } = input;
  const capacity = options.capacity ?? REFERENCE_CAPACITY_PROFILE;
  return rollShopPrices(
    shopSlotLocationsOf(options.shops ?? NO_SHOP_SCOPE), shopPricePlanOf(values), rng, capacity,
  );
};

export { rollPrices };
export type { RollInput };
