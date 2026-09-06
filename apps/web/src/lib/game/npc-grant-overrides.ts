/* @layer bridge-wasm @kind logic */
/**
 * Npc grant overrides — JS-side arming for the in-core scripted-grant
 * substitution table (core/game-hooks/npc_overrides.c), mirroring the chest
 * table's contract in randomizer.ts: the write only records, the gate bit is
 * requested alongside it, and it stays open only while the table has entries.
 */

import { isGrantableReceiveId, isNativeReceiveId } from '@shared/game/data';
import { log } from '../log-bus';
import { getModule } from './wasm-bridge';
import { setNpcOverridesActive } from './live-settings-flags';
import { reassertGateWord3 } from './live-settings';

/** Room key sent to the core for a match-by-item-alone entry. */
const ROOM_ANY = -1;

const refuse = (vanillaItem: number, newItem: number, where: string): boolean => {
  // Both ids index the 76-entry native grant tables — an out-of-range one would
  // corrupt the receipt, so refuse it here like the chest-table setter does.
  if (isNativeReceiveId(vanillaItem) && isGrantableReceiveId(newItem)) return false;
  log.error(`[Randomizer] Npc override refused: item pair 0x${vanillaItem.toString(16)} -> `
    + `0x${newItem.toString(16)} is outside the native grant table (${where})`);
  return true;
};

// Arm kFeatures3_NpcOverrides alongside writing the table — the write itself is
// ungated (record-only), but the gate must be requested here so it has latched into
// WRAM (SyncGateWords, next frame) by the time a giver's grant applies the table.
const armGate = (): ReturnType<typeof getModule> => {
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] npc override setter called with no active module');
    return null;
  }
  setNpcOverridesActive(true);
  reassertGateWord3();
  return mod;
};

// |messageId| is the pre-rendered contextual receipt line for this grant (session
// dialogue), or -1 to keep the core's item-class template fallback. |fireId| is the
// host-assigned completion id reported when the entry substitutes, or -1 for none.
const setNpcGrantOverride = (roomId: number | null, vanillaItem: number, newItem: number, messageId = -1, fireId = -1): void => {
  if (refuse(vanillaItem, newItem, `room ${roomId ?? 'any'}`)) return;
  const mod = armGate();
  if (!mod) return;
  mod.ccall('WasmSetNpcGrantOverride', null, ['number', 'number', 'number', 'number', 'number'],
    [roomId ?? ROOM_ANY, vanillaItem, newItem, messageId, fireId]);
  log.randomizer(`[Randomizer] Npc override set: room ${roomId ?? 'any'} `
    + `item 0x${vanillaItem.toString(16)} -> 0x${newItem.toString(16)} (msg ${messageId})`);
};

// The sprite-keyed entry kind: a roomless giver whose vanilla item is shared with
// other roomless givers, told apart by the sprite executing at the grant seam
// (certified per sprite type by the decomp audit in npc-override-key.ts).
const setNpcGrantSpriteOverride = (spriteType: number, vanillaItem: number, newItem: number, messageId = -1, fireId = -1): void => {
  if (refuse(vanillaItem, newItem, `sprite 0x${spriteType.toString(16)}`)) return;
  const mod = armGate();
  if (!mod) return;
  mod.ccall('WasmSetNpcGrantSpriteOverride', null, ['number', 'number', 'number', 'number', 'number'],
    [spriteType, vanillaItem, newItem, messageId, fireId]);
  log.randomizer(`[Randomizer] Npc override set: sprite 0x${spriteType.toString(16)} `
    + `item 0x${vanillaItem.toString(16)} -> 0x${newItem.toString(16)} (msg ${messageId})`);
};

const clearNpcGrantOverrides = (): void => {
  const mod = getModule();
  if (!mod) return;
  // Empty the table, then close the gate — same double lock as clearItemOverrides.
  mod.ccall('WasmClearNpcGrantOverrides', null, [], []);
  setNpcOverridesActive(false);
  reassertGateWord3();
  log.randomizer('[Randomizer] All npc overrides cleared');
};

export { clearNpcGrantOverrides, setNpcGrantOverride, setNpcGrantSpriteOverride };
