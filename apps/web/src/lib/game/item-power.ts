/* @layer bridge-wasm @kind logic */
/**
 * Item power: JS-side arming of gate word 4 (features.h kFeatures4_*), the
 * word that says how helpful the items are. Every bit is a DIVERGENCE from the
 * unmodified game, so an all-clear word is the game exactly as it shipped and
 * clearing the word is a complete disarm.
 *
 * It is a WRAM gate word, not a host gate, because the game branches on
 * every one of these: a host gate would be invisible to a save state and would
 * desynchronise a replay. Nothing else in the app writes word 4, so a session
 * owns it outright and can write the whole word instead of a masked update.
 *
 * The dark-room lights live in the same word and are OR'd in here instead of
 * written separately, precisely because of that whole-word write: two writers
 * would each clear the other's half. Their own bits are derived next door
 * (dark-room-lights.ts); this file only writes.
 */

import { log } from '../log-bus';
import { darkRoomLightWordOf } from './dark-room-lights';
import { getModule } from './wasm-bridge';
import type { DarkRoomSetting } from '@shared/randomizer/ap-world/dark-rooms/dark-room.type';
import type { ItemPowerSetting } from '@shared/randomizer/ap-world/item-power/item-power.type';

/** features.h kFeatures4_*: keep in lockstep with that enum. */
const ITEM_POWER_BIT = {
  noFairyCatching: 1,
  noByrnaBarrierGuard: 2,
  capeDoubleMagic: 4,
  silverArrowsBossOnly: 8,
  noPowderFairy: 16,
  hammerWakesTablets: 32,
  swordlessMedallions: 64,
  pullableCurtains: 128,
  hammerLastFight: 256,
  hammerBreaksSeal: 512,
} as const;

/** The word a setting asks for; zero means the unmodified game. */
const itemPowerWordOf = (setting: ItemPowerSetting): number => {
  let word = 0;
  if (!setting.catchFairies) word |= ITEM_POWER_BIT.noFairyCatching;
  if (!setting.byrnaInvulnerable) word |= ITEM_POWER_BIT.noByrnaBarrierGuard;
  if (setting.capeDoubleMagic) word |= ITEM_POWER_BIT.capeDoubleMagic;
  if (!setting.silverArrowsAnywhere) word |= ITEM_POWER_BIT.silverArrowsBossOnly;
  if (!setting.powderFairy) word |= ITEM_POWER_BIT.noPowderFairy;
  if (setting.hammerTablets) word |= ITEM_POWER_BIT.hammerWakesTablets;
  if (setting.swordlessMedallions) word |= ITEM_POWER_BIT.swordlessMedallions;
  if (setting.pullableCurtains) word |= ITEM_POWER_BIT.pullableCurtains;
  if (setting.hammerLastFight) word |= ITEM_POWER_BIT.hammerLastFight;
  if (setting.hammerTowerSeal) word |= ITEM_POWER_BIT.hammerBreaksSeal;
  return word;
};

const writeItemPowerWord = (word: number): void => {
  const mod = getModule();
  if (!mod) {
    if (word !== 0) log.error('[Randomizer] setItemPower called with no active module');
    return;
  }
  // Guarded like every other gate-word write: a core built before this word
  // carried bits has no export to call.
  try {
    mod.ccall('WasmSetGateWord', null, ['number', 'number'], [4, word]);
  } catch {
    log.error('[Randomizer] Item power refused: this core has no gate word 4');
  }
};

const setItemPower = (setting: ItemPowerSetting, darkRooms: DarkRoomSetting): void => {
  const word = itemPowerWordOf(setting) | darkRoomLightWordOf(darkRooms);
  writeItemPowerWord(word);
  log.randomizer(`[Randomizer] Item power armed: 0x${word.toString(16)}`);
};

const clearItemPower = (): void => {
  writeItemPowerWord(0);
};

export { ITEM_POWER_BIT, clearItemPower, itemPowerWordOf, setItemPower };
