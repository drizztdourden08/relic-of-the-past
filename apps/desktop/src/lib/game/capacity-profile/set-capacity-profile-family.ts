/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { getModule } from '../wasm-bridge';
import type { CapacityFamilyId } from '@rotp/game-data';
import type { CapacityFamilyArm } from './capacity-profile.type';
import { CAPACITY_FAMILY_INDEX, CAPACITY_FAMILY_LAST_TIER } from './capacity-profile.constants';
import { openCapacityGate } from './open-capacity-gate';

const tierInRange = (family: CapacityFamilyId, tier: number): boolean =>
  Number.isInteger(tier) && tier >= 0 && tier <= CAPACITY_FAMILY_LAST_TIER[family];

const setCapacityProfileFamily = (arm: CapacityFamilyArm): void => {
  const { family, custom, startTier, maxTier } = arm;
  if (custom && (!tierInRange(family, startTier) || !tierInRange(family, maxTier) || maxTier < startTier)) {
    log.error(`[Randomizer] Capacity profile refused: ${family} tiers ${startTier}..${maxTier} `
      + `are off the grid (last tier ${CAPACITY_FAMILY_LAST_TIER[family]})`);
    return;
  }
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setCapacityProfileFamily called with no active module');
    return;
  }
  openCapacityGate();
  mod.ccall('WasmSetCapacityProfile', null, ['number', 'number', 'number', 'number'],
    [CAPACITY_FAMILY_INDEX[family], custom ? 1 : 0, custom ? startTier : 0, custom ? maxTier : 0]);
  log.randomizer(`[Randomizer] Capacity profile set: ${family} `
    + (custom ? `custom tiers ${startTier}..${maxTier}` : 'native grid'));
};

export { setCapacityProfileFamily };
