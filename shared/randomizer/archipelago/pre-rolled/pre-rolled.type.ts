/* @layer shared-game @kind types */
import type { CapacityProfile } from '../../world/capacity/capacity-profile.type';
import type { PondDemandView } from '../../world/pond/pond-ask.type';
import type { ShopPriceView } from '../../world/shops/shop-price.type';
import type { WorldModel } from '../export/export.type';

interface PreRolled {
  pondDemands: PondDemandView;
  shopPrices: ShopPriceView;
  capacity: CapacityProfile;
  world: WorldModel;
}

export type { PreRolled };
