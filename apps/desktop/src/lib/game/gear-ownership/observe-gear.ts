/* @layer bridge-wasm @kind logic */
import { arrowTypeOf } from '@rotp/game-data';
import type { GameUIState } from '@rotp/game-data';
import { getProfileId } from '@rotp/game-core';
import type { GearTiers } from '@rotp/game-core';
import { gearOwnershipState } from '@rotp/game-core';
import { applyTiers } from './apply-tiers';
import { initGearOwnership } from './init-gear-ownership';
import { raiseTiers } from '@rotp/game-core';

const tiersFrom = (state: GameUIState): GearTiers => ({
  sword: state.equipment.sword,
  shield: state.equipment.shield,
  mail: state.equipment.armor,
  bow: Math.max(arrowTypeOf(state.inventory.items[0] ?? 0), 0),
});

const observeGear = (state: GameUIState): void => {
  const id = getProfileId();
  initGearOwnership(id);
  if (!id) return;
  const tiers = tiersFrom(state);
  if (!gearOwnershipState.loaded) {
    const held = gearOwnershipState.pending;
    gearOwnershipState.pending = held ? raiseTiers(held, tiers) : tiers;
    return;
  }
  applyTiers(id, tiers);
};

export { observeGear };
