/* @layer bridge-wasm @kind logic */
import { PRIZE_LOCATIONS } from '@rotp/randomizer';
import { log } from '../../../log-bus';
import { setChestSlotOverride } from '../../randomizer';
import { setNpcGrantOverride, setNpcGrantSpriteOverride } from '../../npc-grant-overrides';
import { setDropOverride } from '../../drop-overrides';
import { setScriptedGrantOverride } from '../../scripted-grant-overrides';
import { setStandingOverride } from '../../standing-overrides';
import { setShopSlotOverride } from '../../shop-overrides';
import { armPrizeShuffle } from '../../prize-shuffle';
import { quietMessageFor } from '@rotp/randomizer';
import { allocateFireId } from '../override-fire-registry';
import type { PhysicalPlan } from '@rotp/randomizer';
import type { MessageIdOf } from '@rotp/randomizer';
import { armedShopState } from '@rotp/randomizer';

const applyOverrides = (plan: PhysicalPlan, messageIdOf: MessageIdOf, tag: string): void => {
  const receiptLineOf = (location: string, localId: number): number => quietMessageFor(localId, messageIdOf(location));
  const armsBossReward = plan.entries.some((entry) =>
    entry.planClass === 'override-npc' && PRIZE_LOCATIONS.has(entry.location));
  if (armsBossReward) armPrizeShuffle();
  armedShopState.entries = [];
  for (const entry of plan.entries) {
    if (entry.planClass === 'override' && entry.target !== undefined) {
      const { roomId, chestIndex, targetLocalId } = entry.target;
      setChestSlotOverride(roomId, chestIndex, targetLocalId, receiptLineOf(entry.location, targetLocalId));
      log.randomizer(`${tag} Overrode "${entry.location}": slot ${chestIndex} -> "${entry.item}" (0x${targetLocalId.toString(16)})`);
    } else if (entry.planClass === 'override-npc' && entry.npcOverride !== undefined) {
      const { roomId, vanillaItemId, spriteType, targetLocalId } = entry.npcOverride;
      const messageId = receiptLineOf(entry.location, targetLocalId);
      const fireId = allocateFireId(entry.location);
      if (spriteType !== undefined) {
        setNpcGrantSpriteOverride(spriteType, vanillaItemId, targetLocalId, messageId, fireId);
      } else {
        setNpcGrantOverride(roomId, vanillaItemId, targetLocalId, messageId, fireId);
      }
      log.randomizer(`${tag} Overrode "${entry.location}": giver grant -> "${entry.item}" (0x${targetLocalId.toString(16)})`);
    } else if (entry.planClass === 'override-drop' && entry.dropOverride !== undefined) {
      const { roomId, big, targetLocalId } = entry.dropOverride;
      setDropOverride(roomId, big, targetLocalId, receiptLineOf(entry.location, targetLocalId), allocateFireId(entry.location));
      log.randomizer(`${tag} Overrode "${entry.location}": ground drop -> "${entry.item}" (0x${targetLocalId.toString(16)})`);
    } else if (entry.planClass === 'override-standing' && entry.standingOverride !== undefined) {
      const { targetLocalId, ...target } = entry.standingOverride;
      setStandingOverride(target, targetLocalId, receiptLineOf(entry.location, targetLocalId), allocateFireId(entry.location));
      log.randomizer(`${tag} Overrode "${entry.location}": standing prize -> "${entry.item}" (0x${targetLocalId.toString(16)})`);
    } else if (entry.planClass === 'override-shop' && entry.shopOverride !== undefined) {
      const { targetLocalId, ...target } = entry.shopOverride;
      setShopSlotOverride(target, targetLocalId, receiptLineOf(entry.location, targetLocalId), allocateFireId(entry.location));
      armedShopState.entries.push({
        location: entry.location, slotIndex: target.slotIndex, depthIndex: target.depthIndex,
      });
      log.randomizer(`${tag} Overrode "${entry.location}": shelf slot -> "${entry.item}" (0x${targetLocalId.toString(16)})`);
    } else if (entry.planClass === 'override-scripted' && entry.scriptedOverride !== undefined) {
      const { target, targetLocalId } = entry.scriptedOverride;
      const armedWithEveryPondRung = target.surface === 'wish-pond';
      if (armedWithEveryPondRung) continue;
      setScriptedGrantOverride(target, targetLocalId, receiptLineOf(entry.location, targetLocalId), allocateFireId(entry.location));
      log.randomizer(`${tag} Overrode "${entry.location}": scripted grant -> "${entry.item}" (0x${targetLocalId.toString(16)})`);
    }
  }
};

export { applyOverrides };
