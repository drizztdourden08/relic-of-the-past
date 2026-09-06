/* @layer bridge-wasm @kind logic */
/**
 * Progressive tier masks — JS-side arming of which rungs of each tiered family
 * exist in this seed (core/game-hooks/progressive_grants.c). One bit per rung,
 * bit 0 the first; a pickup climbs to the lowest rung still present at or above
 * the tier already held, so an unticked middle rung shortens the ladder rather
 * than leaving a hole in it. Record-only writes, the same contract as the
 * capacity plan; the read side sits inside the gated grant seams.
 *
 * The family ORDER is the core's, not the catalog's — the core numbers armour
 * after the gloves and this map is the one place that difference is written
 * down. Clearing disarms every family, which gives each one its whole ladder
 * back: that is what a session which never speaks gets, and it is byte for byte
 * the behaviour the core had before the masks existed.
 */

import { log } from '../log-bus';
import { getModule } from './wasm-bridge';
import { PROGRESSIVE_FAMILIES } from '@shared/randomizer/ap-world/progressive/progressive-families.data';
import { DEFAULT_PROGRESSIVE_MODES, isRandomOrder } from '@shared/randomizer/ap-world/progressive/progressive-modes.data';
import type {
  ProgressiveFamilyId, ProgressiveModeSetting, ProgressiveSetting,
} from '@shared/randomizer/ap-world/progressive/progressive.type';

/** core/game-hooks/progressive_grants.c kFamilies order. */
const CORE_FAMILY_INDEX: Readonly<Record<ProgressiveFamilyId, number>> = {
  sword: 0, shield: 1, glove: 2, mail: 3, bow: 4,
};

const maskOf = (ticks: readonly boolean[]): number =>
  ticks.reduce((mask, ticked, index) => (ticked ? mask | (1 << index) : mask), 0);

/** True while every family still carries every rung, in order — nothing to arm. */
const isFullLadder = (
  setting: ProgressiveSetting, modes: ProgressiveModeSetting = DEFAULT_PROGRESSIVE_MODES,
): boolean =>
  PROGRESSIVE_FAMILIES.every((family) =>
    !isRandomOrder(modes, family.id)
    && family.tiers.every((_tier, index) => setting[family.id][index] !== false));

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
    // The mask still governs the copies a locked vanilla giver hands over, so it
    // is written for every family whatever the order is. The order flag is the
    // separate question: with it set, a pickup carrying the tier's OWN id may
    // arrive at any time and is refused only when it would step the family back
    // down (progressive_grants.c).
    const independent = isRandomOrder(modes, family.id);
    mod.ccall('WasmSetProgressiveIndependent', null, ['number', 'number'],
      [CORE_FAMILY_INDEX[family.id], independent ? 1 : 0]);
    written.push(`${family.id} 0x${mask.toString(16)}${independent ? ' any-order' : ''}`);
  }
  log.randomizer(`[Randomizer] Progressive tiers set: ${written.join(', ')}`);
};

const clearProgressiveTiers = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearProgressiveTiers', null, [], []);
  log.randomizer('[Randomizer] Progressive tiers cleared');
};

export { clearProgressiveTiers, isFullLadder, setProgressiveTiers };
