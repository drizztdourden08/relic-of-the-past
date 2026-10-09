/* @layer bridge-wasm @kind logic */
import type { CapacityFamilyId } from '@rotp/game-data';
import { log } from '../../log-bus';
import { getModule } from '@rotp/game-core';
import { CAPACITY_FAMILY_INDEX, CAPACITY_FAMILY_LAST_TIER } from '../capacity-profile/capacity-profile.constants';
import { MIN_JUMP, NO_MESSAGE } from './capacity-plan.constants';

const setCapacityPlanJumps = (
  family: CapacityFamilyId, jumps: readonly number[], messageIds: readonly number[] = [],
): void => {
  if (jumps.length > CAPACITY_FAMILY_LAST_TIER[family]) {
    log.error(`[Randomizer] Capacity plan refused: ${family} carries ${jumps.length} jumps over a `
      + `${CAPACITY_FAMILY_LAST_TIER[family]}-rung ladder`);
    return;
  }
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setCapacityPlanJumps called with no active module');
    return;
  }
  jumps.forEach((jump, index) => {
    mod.ccall('WasmSetCapacityPlanJump', null, ['number', 'number', 'number', 'number'],
      [CAPACITY_FAMILY_INDEX[family], index, Math.max(MIN_JUMP, Math.trunc(jump)), messageIds[index] ?? NO_MESSAGE]);
  });
  log.randomizer(`[Randomizer] Capacity plan set: ${family} [${jumps.join(', ')}]`
    + (messageIds.length > 0 ? ` (lines ${messageIds[0]}..${messageIds[messageIds.length - 1]})` : ''));
};

export { setCapacityPlanJumps };
