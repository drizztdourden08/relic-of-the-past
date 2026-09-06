/* @layer bridge-wasm @kind logic */
/**
 * Scripted-grant overrides: JS-side arming for the in-core substitution
 * slots covering scripted grants that never cross the receive seam (the
 * upgrade pond's two capacity purchases, the cave bat's meter upgrade, the
 * prize minigame's once-only top prize, see core/game-hooks/scripted_grants.c).
 * Same contract as the other override bridges: the write only records, the
 * gate bit is requested alongside it, and it stays open only while armed.
 */

import { isGrantableReceiveId } from '@shared/game/data';
import { log } from '../log-bus';
import { getModule } from './wasm-bridge';
import { setScriptedGrantsActive } from './live-settings-flags';
import { setPondPrize } from './pond-plan';
import { reassertGateWord3 } from './live-settings';

/**
 * The certified scripted-grant surfaces. The pond variant is the odd one out:
 * it is armed through the pond plan's own table (pond-plan.ts) instead of the
 * three slots here, because under a plan the pond hands over a numbered
 * sequence of prizes instead of one purchase per family, but it stays the
 * same PLAN CLASS, so the classifier, the fire registry and the poller keep
 * one path for every scripted grant.
 */
type ScriptedGrantSurface =
  | { surface: 'capacity'; kind: 0 | 1 }
  | { surface: 'pond'; prize: number }
  | { surface: 'bat' }
  | { surface: 'minigame'; roomId: number };

const armCall = (mod: NonNullable<ReturnType<typeof getModule>>, target: ScriptedGrantSurface,
  newItem: number, messageId: number, fireId: number): void => {
  if (target.surface === 'pond') {
    setPondPrize({ prize: target.prize, newItem, messageId, fireId });
    return;
  }
  if (target.surface === 'capacity') {
    mod.ccall('WasmSetCapacityGrantOverride', null, ['number', 'number', 'number', 'number'],
      [target.kind, newItem, messageId, fireId]);
    return;
  }
  if (target.surface === 'bat') {
    mod.ccall('WasmSetBatGrantOverride', null, ['number', 'number', 'number'],
      [newItem, messageId, fireId]);
    return;
  }
  mod.ccall('WasmSetMinigamePrizeOverride', null, ['number', 'number', 'number', 'number'],
    [target.roomId, newItem, messageId, fireId]);
};

// |messageId| is the pre-rendered contextual receipt line for this grant, or -1 for
// the core's item-class template fallback. |fireId| is the host-assigned completion
// id reported when the entry substitutes, or -1 for none.
const setScriptedGrantOverride = (target: ScriptedGrantSurface, newItem: number,
  messageId = -1, fireId = -1): void => {
  if (!isGrantableReceiveId(newItem)) {
    log.error(`[Randomizer] Scripted grant override refused: item 0x${newItem.toString(16)} `
      + `is outside the grantable id range (${target.surface})`);
    return;
  }
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setScriptedGrantOverride called with no active module');
    return;
  }
  // Arm kFeatures3_ScriptedGrants alongside the record-only write, so the gate has
  // latched into WRAM (SyncGateWords, next frame) by the time a handler applies it.
  // A pond prize rides the pond plan's own gate, armed with the plan itself; the
  // three fixed slots ride the scripted-grant gate.
  if (target.surface !== 'pond') {
    setScriptedGrantsActive(true);
    reassertGateWord3();
  }
  armCall(mod, target, newItem, messageId, fireId);
  log.randomizer(`[Randomizer] Scripted grant override set: ${target.surface} `
    + `-> 0x${newItem.toString(16)} (msg ${messageId})`);
};

const clearScriptedGrantOverrides = (): void => {
  const mod = getModule();
  if (!mod) return;
  // Empty the slots, then close the gate, same double lock as the other tables.
  mod.ccall('WasmClearScriptedGrantOverrides', null, [], []);
  setScriptedGrantsActive(false);
  reassertGateWord3();
  log.randomizer('[Randomizer] All scripted grant overrides cleared');
};

export { clearScriptedGrantOverrides, setScriptedGrantOverride };
export type { ScriptedGrantSurface };
