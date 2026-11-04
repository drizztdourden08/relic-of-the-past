/* @layer shared-game @kind types */
import type { FillBuild, WorldGameTypes } from '@drizztdourden08/brock-randomizer/world';
import type { Rng } from '../../../rng';
import type { RotpWorld } from '../../world.type';
import type { PondDemandView } from '../../pond/pond-ask.type';
import type { ShopPriceView } from '../../shops/shop-price.type';
import type { DeliverableSets, GenerateRequest, PlacementSweep } from '../fill.type';
import type { FillWorld } from '../fill-world.type';
import type { Placement } from '../placement.type';

interface RotpPrep {
  deliverable: Required<DeliverableSets>;
  pondDemands: PondDemandView;
}

interface RotpBuild extends FillBuild<RotpWorld> {
  fillWorld: FillWorld;
  shopPrices: ShopPriceView;
  shufflePrizes: boolean;
  deliverable: Required<DeliverableSets>;
}

interface RotpGameTypes extends WorldGameTypes {
  world: RotpWorld;
  request: GenerateRequest;
  prep: RotpPrep;
  build: RotpBuild;
  placement: Placement;
}

interface AttemptContext {
  request: GenerateRequest;
  prep: RotpPrep;
  rng: Rng;
}

interface FinishedAttempt {
  build: RotpBuild;
  sweep: PlacementSweep;
  prep: RotpPrep;
  request: GenerateRequest;
  attempts: number;
}

export type { AttemptContext, FinishedAttempt, RotpBuild, RotpGameTypes, RotpPrep };
