/* @layer bridge-wasm @kind logic */
/**
 * Online override plumbing — builds the scout plan for every detectable
 * location, classifies scout answers through the bridge classifier (the
 * scouted item stands in for the nameView item), arms in-core overrides for
 * the override class, and delivers server-sent items that no override covers.
 *
 * Scout-first dedup: every scouted location id joins `overriddenLocationIds`
 * BEFORE the scout is sent — a reconnect replays already-collected items via
 * ReceivedItems before LocationInfo answers, and those must not be delivered
 * twice. A location leaves the set only when its scout answer classifies as
 * anything but an armed override (deliver-class, locked, or a plan error),
 * so its receive-path delivery is not swallowed.
 */

import { all } from '@shared/game/data';
import { RANDOMIZER_RECEIPT_MSG } from '@shared/asset-extraction/text/data/randomizer-templates';
import { classifyReceiptItem } from '@shared/randomizer/receipt-text/receipt-item-class';
import { renderOnline } from '@shared/randomizer/receipt-text/receipt-templates';
import { renderReceiptMessage } from '@shared/randomizer/receipt-text/render-receipt-message';
import { log } from '../../log-bus';
import { deliverItem } from '../delivery-api';
import { appendSessionReceiptMessage } from '../session-dialogue';
import { setChestSlotOverride } from '../randomizer';
import { setNpcGrantOverride, setNpcGrantSpriteOverride } from '../npc-grant-overrides';
import { setDropOverride } from '../drop-overrides';
import { setScriptedGrantOverride } from '../scripted-grant-overrides';
import { setStandingOverride } from '../standing-overrides';
import { NO_SHOP_SCOPE } from '@shared/randomizer/ap-world/shops/shop-scope-from-values';
import { classifyLocation } from './ap-bridge';
import { standardCheckName } from './check-names';
import { detectionOf } from './check-detection';
import { allocateFireId } from './override-fire-registry';
import { suppressLocationReport } from './location-poller';
import { resolveServerItemLocalId } from './online-items';
import type { ApGameData, ApNetworkItem } from './ap-protocol.type';
import type { PlanEntry, PlanError } from './physical-plan.type';
import type { PollEntry } from './location-poller';
import type { ScopeFlags } from './ap-bridge';

interface ScoutMaps {
  nameByLocationId: Map<number, string>;
  locationIdByName: Map<string, number>;
  overriddenLocationIds: Set<number>;
}

/**
 * Online scouts the whole shuffleable surface — nothing is generation-locked.
 * Shelf slots are the one exception: a server's shop locations have no scout
 * mapping here yet, so no shelf opens and every shop behaves as it always has.
 */
const ONLINE_FLAGS: ScopeFlags = {
  keyDropShuffle: true, includeNpcChecks: true, includeWorldItems: true, shufflePrizes: true,
  shops: NO_SHOP_SCOPE, shopPrices: {},
};

interface ScoutPlan {
  locationIds: number[];
  pollEntries: PollEntry[];
}

const buildScoutPlan = (gameData: ApGameData, maps: ScoutMaps): ScoutPlan => {
  const locationIds: number[] = [];
  const pollEntries: PollEntry[] = [];
  for (const check of all('check')) {
    const detection = detectionOf(check.id);
    if (detection === null) continue;
    const name = standardCheckName(check.id);
    const locationId = gameData.location_name_to_id[name];
    if (locationId === undefined) {
      log.randomizer(`[Online] No server location for check: ${name}`, 'warn');
      continue;
    }
    maps.nameByLocationId.set(locationId, name);
    maps.locationIdByName.set(name, locationId);
    maps.overriddenLocationIds.add(locationId);
    locationIds.push(locationId);
    pollEntries.push({ key: name, detection });
  }
  return { locationIds, pollEntries };
};

const isPlanError = (row: PlanEntry | PlanError): row is PlanError =>
  (row as PlanError).reason !== undefined;

/** Baked class-template id for a scouted grant, when no session line composed. */
const classMsgOf = (itemName: string): number => {
  const itemClass = classifyReceiptItem(itemName);
  if (itemClass.kind === 'progressive') return RANDOMIZER_RECEIPT_MSG.progressive;
  if (itemClass.kind === 'dungeon-item') return RANDOMIZER_RECEIPT_MSG.dungeonItem;
  return RANDOMIZER_RECEIPT_MSG.generic;
};

/**
 * Pre-render the contextual line for a scouted physical grant. Online has no
 * frozen placement, so no small-key totals — the dungeon-item line renders
 * without a count rather than with a wrong one.
 */
const scoutedOverrideMsg = (locationName: string, itemName: string): number => {
  const text = renderReceiptMessage({ kind: 'physical', itemName, locationName });
  return appendSessionReceiptMessage(text) ?? classMsgOf(itemName);
};

const applyScoutedLocations = (
  locations: ApNetworkItem[],
  itemNameById: Map<number, string>,
  maps: ScoutMaps,
): void => {
  for (const entry of locations) {
    const name = maps.nameByLocationId.get(entry.location);
    if (name === undefined) continue;
    const itemName = itemNameById.get(entry.item);
    if (itemName === undefined) {
      log.randomizer(`[Online] Unmapped scouted item ${entry.item} at ${name} — receive path stays open`, 'warn');
      maps.overriddenLocationIds.delete(entry.location);
      continue;
    }
    const row = classifyLocation(name, itemName, ONLINE_FLAGS);
    if (!isPlanError(row) && row.planClass === 'override' && row.target !== undefined) {
      setChestSlotOverride(row.target.roomId, row.target.chestIndex, row.target.targetLocalId,
        scoutedOverrideMsg(name, itemName));
      log.randomizer(`[Online] Override armed: ${name} → ${itemName}`);
      continue;
    }
    // Scouted npc checks substitute in-core like chests: the giver's own cutscene hands
    // over the scouted item, so the location stays in the dedup set — a replayed
    // ReceivedItems entry for it must not deliver the item a second time. Completion
    // comes from the substitution seam (fire id), so polling is suppressed for the
    // row — its detection may be possession-based and would misreport.
    if (!isPlanError(row) && row.planClass === 'override-npc' && row.npcOverride !== undefined) {
      const { roomId, vanillaItemId, spriteType, targetLocalId } = row.npcOverride;
      const messageId = scoutedOverrideMsg(name, itemName);
      const fireId = allocateFireId(name);
      if (spriteType !== undefined) setNpcGrantSpriteOverride(spriteType, vanillaItemId, targetLocalId, messageId, fireId);
      else setNpcGrantOverride(roomId, vanillaItemId, targetLocalId, messageId, fireId);
      suppressLocationReport(name);
      log.randomizer(`[Online] Npc override armed: ${name} → ${itemName}`);
      continue;
    }
    // Scouted key drops substitute in-core too: the drop on the ground shows and
    // grants the scouted item natively, so the location stays in the dedup set.
    if (!isPlanError(row) && row.planClass === 'override-drop' && row.dropOverride !== undefined) {
      const { roomId, big, targetLocalId } = row.dropOverride;
      setDropOverride(roomId, big, targetLocalId, scoutedOverrideMsg(name, itemName), allocateFireId(name));
      suppressLocationReport(name);
      log.randomizer(`[Online] Drop override armed: ${name} → ${itemName}`);
      continue;
    }
    // Scouted standing prizes: the pickup shows and grants the scouted item natively.
    if (!isPlanError(row) && row.planClass === 'override-standing' && row.standingOverride !== undefined) {
      const { targetLocalId, ...target } = row.standingOverride;
      setStandingOverride(target, targetLocalId, scoutedOverrideMsg(name, itemName), allocateFireId(name));
      suppressLocationReport(name);
      log.randomizer(`[Online] Standing override armed: ${name} → ${itemName}`);
      continue;
    }
    // Scouted scripted-grant surfaces (the upgrade pond, the cave bat, the prize
    // minigame): the handler's own grant moment hands over the scouted item.
    if (!isPlanError(row) && row.planClass === 'override-scripted' && row.scriptedOverride !== undefined) {
      const { target, targetLocalId } = row.scriptedOverride;
      setScriptedGrantOverride(target, targetLocalId, scoutedOverrideMsg(name, itemName), allocateFireId(name));
      suppressLocationReport(name);
      log.randomizer(`[Online] Scripted grant override armed: ${name} → ${itemName}`);
      continue;
    }
    maps.overriddenLocationIds.delete(entry.location);
    const why = isPlanError(row) ? row.reason : `${row.planClass} class`;
    log.randomizer(`[Online] No override for ${name} (${itemName}, ${why}) — receive path stays open`);
  }
};

const deliverReceivedItems = (
  items: ApNetworkItem[],
  itemNameById: Map<number, string>,
  overriddenLocationIds: Set<number>,
): void => {
  for (const item of items) {
    if (overriddenLocationIds.has(item.location)) {
      log.randomizer(`[Online] Skipping receive for location ${item.location} — the chest grants it in-world`);
      continue;
    }
    const itemName = itemNameById.get(item.item);
    const localId = itemName === undefined ? undefined : resolveServerItemLocalId(itemName);
    if (itemName === undefined || localId === undefined) {
      log.randomizer(`[Online] Unknown received item ${item.item} (location ${item.location})`, 'warn');
      continue;
    }
    // Online context beats the core's item-class default: this item was sent by
    // another player, so the receipt shows the online line — pre-rendered with the
    // finder's slot when the session dialogue is live, the class template otherwise.
    const messageId = appendSessionReceiptMessage(renderOnline(`Player ${item.player}`, itemName))
      ?? RANDOMIZER_RECEIPT_MSG.online;
    deliverItem(localId, itemName, 'randomizer', messageId);
    log.randomizer(`[Online] Received: ${itemName}`);
  }
};

export { applyScoutedLocations, buildScoutPlan, deliverReceivedItems };
export type { ScoutMaps, ScoutPlan };
