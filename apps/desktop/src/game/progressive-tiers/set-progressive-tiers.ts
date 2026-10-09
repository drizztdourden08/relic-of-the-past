/* @layer bridge-wasm @kind logic */
import type { ProgressiveModeSetting, ProgressiveSetting } from '@rotp/randomizer';
import { log } from '../../log-bus';
import { getModule } from '@rotp/game-core';
import { PROGRESSIVE_FAMILIES, DEFAULT_PROGRESSIVE_MODES, isRandomOrder, CORE_FAMILY_INDEX } from '@rotp/randomizer';

const maskOf = (ticks: readonly boolean[]): number =>
  ticks.reduce((mask, ticked, index) => (ticked ? mask | (1 << index) : mask), 0);

const setProgressiveTiers = (
  setting: ProgressiveSetting, modes: ProgressiveModeSetting = DEFAULT_PROGRESSIVE_MODES,
): void => {
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setProgressiveTiers called with no active module');
    return;
  }
  const written: string[] = [];
  for (const family of PROGRESSIVE_FAMILIES) {
    const mask = maskOf(setting[family.id]);
    mod.ccall('WasmSetProgressiveTiers', null, ['number', 'number'],
      [CORE_FAMILY_INDEX[family.id], mask]);
    const independent = isRandomOrder(modes, family.id);
    mod.ccall('WasmSetProgressiveIndependent', null, ['number', 'number'],
      [CORE_FAMILY_INDEX[family.id], independent ? 1 : 0]);
    written.push(`${family.id} 0x${mask.toString(16)}${independent ? ' any-order' : ''}`);
  }
  log.randomizer(`[Randomizer] Progressive tiers set: ${written.join(', ')}`);
};

export { setProgressiveTiers };
