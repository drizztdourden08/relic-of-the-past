/* @layer bridge-wasm @kind logic */
/**
 * Dungeon prize shuffle gate: JS-side arming for the in-core reward seam
 * (core/game-hooks/prize_grants.c), following the same contract as the
 * substitution tables: the gate is requested only while a plan actually
 * overrides a boss reward, so a boss room only ever consults the hook-owned
 * "reward claimed" save bit inside such a session.
 *
 * There is no table of its own here, because a reward substitutes through the npc
 * override table like any other scripted grant. This bit only tells the core
 * that the rewards ARE shuffled, which is what licenses the claimed-bit read in
 * the two boss room tags and the assigned-crystal bank in the rising crystal.
 */

import { log } from '../log-bus';
import { setPrizeShuffleActive } from './live-settings-flags';
import { reassertGateWord3 } from './live-settings';

const armPrizeShuffle = (): void => {
  setPrizeShuffleActive(true);
  reassertGateWord3();
  log.randomizer('[Randomizer] Prize shuffle armed: boss rewards read the hook-owned claimed bit');
};

const disarmPrizeShuffle = (): void => {
  setPrizeShuffleActive(false);
  reassertGateWord3();
};

export { armPrizeShuffle, disarmPrizeShuffle };
