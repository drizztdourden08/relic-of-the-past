/* @layer shared-game @kind types */
import type { Rng } from '../../rng';
import type { PondDemandView } from '../pond/pond-ask.type';
import type { ShopPriceView } from '../shops/shop-price.type';
import type { RandomizerOptionsSnapshot } from '../options.type';
import type { DeliverableSets } from './fill.type';
import type { FillWorld } from './fill-world.type';

interface BuildRolledFillWorldInput {
  seed: string;
  rngSeed: string;
  snapshot: RandomizerOptionsSnapshot;
  deliverable: DeliverableSets;
  pondDemands: PondDemandView;
}

interface RolledFillWorld {
  rng: Rng;
  shopPrices: ShopPriceView;
  fillWorld: FillWorld;
}

export type { BuildRolledFillWorldInput, RolledFillWorld };
