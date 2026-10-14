/* @layer shared-game @kind types */
import type { ItemKey } from '../item-ids';
import type { CapacityProfile, CurveShape } from '../capacity/capacity-profile.type';
import type { PondAskSetting } from './pond-ask.type';
import type { PondPlan } from './pond-profile.type';
import type { Rng } from '../../rng';

interface PondDemandRoll {
  plan: PondPlan;
  ask: PondAskSetting;
  shape: CurveShape;
  rng: Rng;
  capacity: CapacityProfile;
  itemPool: readonly ItemKey[];
}

export type { PondDemandRoll };
