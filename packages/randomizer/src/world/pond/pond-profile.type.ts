/* @layer shared-game @kind types */
import type { LocationKey } from '../location-key';
import type { CurveShape } from '../capacity/capacity-profile.type';
import type { PondAskSetting } from './pond-ask.type';

type PondMode = 'capacity' | 'vanilla-cost' | 'custom';

interface PondCustomSetting {
  mode: 'custom';
  start: number;
  max: number;
  ask?: PondAskSetting;
  throws: number;
  items: number;
  shape: CurveShape;
}

interface PondFixedSetting {
  mode: 'vanilla-cost';
  items: number;
  ask?: PondAskSetting;
}

type PondSetting =
  | { mode: 'capacity' }
  | PondFixedSetting
  | PondCustomSetting;

interface PondThrow {
  price: number;
  prize: number;
  refund: number;
}

interface PondPlan {
  mode: PondMode;
  throws: readonly PondThrow[];
  locations: readonly LocationKey[];
  worstPriceOfPrize: readonly number[];
  totalPrice: number;
}

export type { PondCustomSetting, PondFixedSetting, PondMode, PondPlan, PondSetting, PondThrow };
