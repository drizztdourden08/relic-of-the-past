/* @layer renderer-hooks @kind types */
import type { PondAskSetting, PondCeilings } from '@rotp/randomizer';

type PondAskModelParams = {
  ask: PondAskSetting;
  priceStops: readonly string[];
  priceRange: readonly [number, number];
  hasLadder: boolean;
  ceilings: PondCeilings;
};

export type { PondAskModelParams };
