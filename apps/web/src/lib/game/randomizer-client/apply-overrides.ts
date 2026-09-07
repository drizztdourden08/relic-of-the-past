/* @layer bridge-wasm @kind logic */
/**
 * Plan arming: pushes a physical plan's override entries into the in-core
 * substitution tables (chest / npc / drop / standing), wiring each physical
 * entry's contextual message and completion fire id, and derives the poll
 * list: physical override rows report from the substitution seam (the fire
 * id), so only chest, deliver and locked rows are polled.
 */

import { log } from '../../log-bus';
import { setChestSlotOverride } from '../randomizer';
import { setNpcGrantOverride, setNpcGrantSpriteOverride } from '../npc-grant-overrides';
import { setDropOverride } from '../drop-overrides';
import { setScriptedGrantOverride } from '../scripted-grant-overrides';
import { setStandingOverride } from '../standing-overrides';
import { setShopSlotOverride } from '../shop-overrides';
import { armPrizeShuffle } from '../prize-shuffle';
import { getModule } from '../wasm-bridge';
import { PRIZE_LOCATIONS } from '@shared/randomizer/ap-world/special-locations.data';
import { allocateFireId, markLocationFired } from './override-fire-registry';
import { FIRE_REPORTED_CLASSES } from './fire-reported-classes';
import type { PhysicalPlan } from './physical-plan.type';
import type { PollEntry } from './location-poller';

/** location name → the receipt-message id its grant should show (-1 = class default). */
type MessageIdOf = (locationName: string) => number;

/**
 * Armed shop entries this session, kept for rescanShopCatchUp: arming can run
 * before the profile's SRAM is actually the active WRAM state (the test
 * harness's --auto-state loads a slot into an already-running module, after
 * the session has already armed against whatever booted), so a single
 * check-at-arm-time can read stale sold counters. The tracker bridge's own
 * poll loop re-runs the scan on an interval instead, which is correct
 * regardless of when the real SRAM becomes current.
 */
let armedShopEntries: { locationName: string; slotIndex: number; depthIndex: number }[] = [];

/** Whether a shelf's Nth purchase already happened, per its SRAM sold counter
 * (core/game-hooks/shop_table.c). The counter survives save/reload; a
 * purchase made in an earlier session has no live fire-id event left to
 * report it, so this reads the persisted fact directly instead. */
const shopSlotAlreadySold = (slotIndex: number, depthIndex: number): boolean => {
  const mod = getModule();
  if (!mod) return false;
  const sold = mod.ccall('WasmGetShopSlotSold', 'number', ['number'], [slotIndex]) as number;
  return depthIndex < sold;
};

/** Re-checks every armed shop slot against its current SRAM sold counter and
 * backfills anything already bought. Safe to call repeatedly: markLocationFired
 * no-ops on a location already marked. */
const rescanShopCatchUp = (): void => {
  for (const { locationName, slotIndex, depthIndex } of armedShopEntries) {
    if (shopSlotAlreadySold(slotIndex, depthIndex)) markLocationFired(locationName);
  }
};

const applyOverrides = (plan: PhysicalPlan, messageIdOf: MessageIdOf, tag: string): void => {
  // A boss reward substitutes through the npc table like any other scripted grant, but
  // the core also has to stop reading the dungeon's own pendant/crystal bit as "reward
  // claimed", so the reward gate is requested exactly when such a row is armed.
  if (plan.entries.some((entry) =>
    entry.planClass === 'override-npc' && PRIZE_LOCATIONS.has(entry.locationName))) {
    armPrizeShuffle();
  }
  armedShopEntries = [];
  for (const entry of plan.entries) {
    if (entry.planClass === 'override' && entry.target !== undefined) {
      const { roomId, chestIndex, targetLocalId } = entry.target;
      setChestSlotOverride(roomId, chestIndex, targetLocalId, messageIdOf(entry.locationName));
      log.randomizer(`${tag} Overrode "${entry.locationName}": slot ${chestIndex} -> "${entry.itemName}" (0x${targetLocalId.toString(16)})`);
    } else if (entry.planClass === 'override-npc' && entry.npcOverride !== undefined) {
      const { roomId, vanillaItemId, spriteType, targetLocalId } = entry.npcOverride;
      const messageId = messageIdOf(entry.locationName);
      const fireId = allocateFireId(entry.locationName);
      if (spriteType !== undefined) {
        setNpcGrantSpriteOverride(spriteType, vanillaItemId, targetLocalId, messageId, fireId);
      } else {
        setNpcGrantOverride(roomId, vanillaItemId, targetLocalId, messageId, fireId);
      }
      log.randomizer(`${tag} Overrode "${entry.locationName}": giver grant -> "${entry.itemName}" (0x${targetLocalId.toString(16)})`);
    } else if (entry.planClass === 'override-drop' && entry.dropOverride !== undefined) {
      const { roomId, big, targetLocalId } = entry.dropOverride;
      setDropOverride(roomId, big, targetLocalId, messageIdOf(entry.locationName), allocateFireId(entry.locationName));
      log.randomizer(`${tag} Overrode "${entry.locationName}": ground drop -> "${entry.itemName}" (0x${targetLocalId.toString(16)})`);
    } else if (entry.planClass === 'override-standing' && entry.standingOverride !== undefined) {
      const { targetLocalId, ...target } = entry.standingOverride;
      setStandingOverride(target, targetLocalId, messageIdOf(entry.locationName), allocateFireId(entry.locationName));
      log.randomizer(`${tag} Overrode "${entry.locationName}": standing prize -> "${entry.itemName}" (0x${targetLocalId.toString(16)})`);
    } else if (entry.planClass === 'override-shop' && entry.shopOverride !== undefined) {
      const { targetLocalId, ...target } = entry.shopOverride;
      setShopSlotOverride(target, targetLocalId, messageIdOf(entry.locationName), allocateFireId(entry.locationName));
      armedShopEntries.push({
        locationName: entry.locationName, slotIndex: target.slotIndex, depthIndex: target.depthIndex,
      });
      log.randomizer(`${tag} Overrode "${entry.locationName}": shelf slot -> "${entry.itemName}" (0x${targetLocalId.toString(16)})`);
    } else if (entry.planClass === 'override-scripted' && entry.scriptedOverride !== undefined) {
      const { target, targetLocalId } = entry.scriptedOverride;
      setScriptedGrantOverride(target, targetLocalId, messageIdOf(entry.locationName), allocateFireId(entry.locationName));
      log.randomizer(`${tag} Overrode "${entry.locationName}": scripted grant -> "${entry.itemName}" (0x${targetLocalId.toString(16)})`);
    }
  }
};

const pollEntriesOf = (plan: PhysicalPlan, tag: string): PollEntry[] => {
  const entries: PollEntry[] = [];
  for (const entry of plan.entries) {
    // Physical override rows report from the substitution seam, so polling them
    // would misfire on possession-style detections and adds nothing else.
    if (FIRE_REPORTED_CLASSES.has(entry.planClass)) continue;
    if (entry.detection === undefined) {
      log.randomizer(`${tag} Poll-blind (vanilla-locked, never reported): "${entry.locationName}"`, 'warn');
      continue;
    }
    entries.push({ key: entry.locationName, detection: entry.detection });
  }
  return entries;
};

const clearArmedShopEntries = (): void => {
  armedShopEntries = [];
};

export { applyOverrides, clearArmedShopEntries, pollEntriesOf, rescanShopCatchUp };
export type { MessageIdOf };
