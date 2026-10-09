/* @layer shared-game @kind logic */
import { WALLET } from '../capacity/capacity-family';
import { reachableTopOf } from '../capacity/reachable-top';
import { FINAL_FIGHT_SILVER_HITS } from '../final-fight.constants';
import { RETRO_PRICE_CEILING } from './retro-bow.constants';
import type { CapacityProfile } from '../capacity/capacity-profile.type';
import type { RetroCostCeilings } from './retro.type';

const retroCostCeilingsOf = (profile: CapacityProfile): RetroCostCeilings => {
  const top = Math.min(RETRO_PRICE_CEILING, reachableTopOf(WALLET, profile));
  return { wood: top, silver: Math.floor(top / FINAL_FIGHT_SILVER_HITS) };
};

export { retroCostCeilingsOf };
