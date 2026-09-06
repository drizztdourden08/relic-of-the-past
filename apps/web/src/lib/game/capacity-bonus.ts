/* @layer bridge-wasm @kind logic */
/**
 * Capacity pickup bonus: JS-side arming of the per-family bonus table the
 * core's upgrade resolvers read (core/game-hooks/upgrade_bonus.c) and of gate
 * word 5 (features.h kFeatures5_CapacityBonus), the word that says a borrowed
 * receipt pays the profile's bonus, not its native goods. Same shape as
 * the item-power word: nothing else in the app writes word 5, so a session
 * owns it outright and writes the whole word; the table writes are record-only,
 * and clearing both is a complete disarm, so every payout seam is back on its
 * vendored expression, byte for byte.
 */

import { CAPACITY_FAMILY_IDS } from '@shared/game/data';
import { log } from '../log-bus';
import { CAPACITY_FAMILY_INDEX } from './capacity-profile.constants';
import { getModule } from './wasm-bridge';
import type { CapacityBonusSetting } from '@shared/randomizer/ap-world/capacity';

/** features.h kFeatures5_CapacityBonus: keep in lockstep with that enum. */
const CAPACITY_BONUS_BIT = 1;
const GATE_WORD = 5;

const writeGateWord = (word: number): void => {
  const mod = getModule();
  if (!mod) return;
  // Guarded like every other gate-word write: a core built before this word
  // carried bits has no export to call.
  try {
    mod.ccall('WasmSetGateWord', null, ['number', 'number'], [GATE_WORD, word]);
  } catch {
    log.error('[Randomizer] Capacity bonus refused: this core has no gate word 5');
  }
};

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
  writeGateWord(CAPACITY_BONUS_BIT);
  const summary = CAPACITY_FAMILY_IDS
    .map((family) => `${family} ${setting[family].percent}% of the ${setting[family].stepBase ? 'step' : 'ceiling'}`);
  log.randomizer(`[Randomizer] Capacity bonus armed: ${summary.join(', ')}`);
};

const clearCapacityBonus = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearCapacityBonus', null, [], []);
  writeGateWord(0);
  log.randomizer('[Randomizer] Capacity bonus cleared');
};

export { clearCapacityBonus, setCapacityBonus };
