/* @layer bridge-wasm @kind logic */
import { arrowTypeOf } from '@rotp/game-data';
import type { GameUIState } from '@rotp/game-data';
import { getProfileId } from '../wasm-bridge';
import type { GearTiers } from './gear-ownership.type';
import { gearOwnershipState } from './gear-ownership-state';
import { applyTiers } from './apply-tiers';
import { initGearOwnership } from './init-gear-ownership';
import { raiseTiers } from './raise-tiers';

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
