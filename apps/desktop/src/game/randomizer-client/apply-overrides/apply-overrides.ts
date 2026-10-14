/* @layer bridge-wasm @kind logic */
import { PRIZE_LOCATIONS, quietMessageFor, armedShopState } from '@rotp/randomizer';
import { armPrizeShuffle } from '../../prize-shuffle';
import { OVERRIDE_APPLIERS } from './apply-overrides.constants';
import type { PhysicalPlan, MessageIdOf } from '@rotp/randomizer';

const applyOverrides = (plan: PhysicalPlan, messageIdOf: MessageIdOf, tag: string): void => {
  const receiptLineOf = (location: string, localId: number): number => quietMessageFor(localId, messageIdOf(location));
  const armsBossReward = plan.entries.some((entry) =>
    entry.planClass === 'override-npc' && PRIZE_LOCATIONS.has(entry.location));
  if (armsBossReward) armPrizeShuffle();
  armedShopState.entries = [];
  for (const entry of plan.entries) OVERRIDE_APPLIERS[entry.planClass]?.(entry, { tag, receiptLineOf });
};

export { applyOverrides };
