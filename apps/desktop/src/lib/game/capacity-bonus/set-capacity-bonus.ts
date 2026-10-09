/* @layer bridge-wasm @kind logic */
import { CAPACITY_FAMILY_IDS } from '@rotp/game-data';
import type { CapacityBonusSetting } from '@shared/randomizer/world/capacity';
import { log } from '../../log-bus';
import { CAPACITY_FAMILY_INDEX } from '../capacity-profile/capacity-profile.constants';
import { setCapacityHalf } from '../gate-word-5';
import { getModule } from '../wasm-bridge';
import { CAPACITY_BONUS_BIT } from './capacity-bonus.constants';

const setCapacityBonus = (setting: CapacityBonusSetting): void => {
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setCapacityBonus called with no active module');
    return;
  }
  for (const family of CAPACITY_FAMILY_IDS) {
    const { percent, stepBase } = setting[family];
    mod.ccall('WasmSetCapacityBonus', null, ['number', 'number', 'number'],
      [CAPACITY_FAMILY_INDEX[family], Math.trunc(percent), stepBase ? 1 : 0]);
  }
  setCapacityHalf(CAPACITY_BONUS_BIT);
  const summary = CAPACITY_FAMILY_IDS
    .map((family) => `${family} ${setting[family].percent}% of the ${setting[family].stepBase ? 'step' : 'ceiling'}`);
  log.randomizer(`[Randomizer] Capacity bonus armed: ${summary.join(', ')}`);
};

export { setCapacityBonus };
