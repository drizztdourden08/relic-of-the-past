/* @layer bridge-wasm @kind logic */
import { getCheck } from '@rotp/game-data';
import { checkIdOfLocation } from '../../world/location-record';
import { detectionOf, withProgressBaseline } from '../check-detection';
import { freestandingKeyDropOf } from '../freestanding-key-drops';
import { isBigKeyDrop } from '../key-drop-size';
import { npcOverrideKeyOf } from '../npc-override-key';
import { scriptedOverrideKeyOf } from '../scripted-override-key';
import { standingOverrideKeyOf } from '../standing-override-key';
import { shopOverrideKeyOf } from '../shop-override-key';
import { pondPrizeTargetOf } from '../pond-prize-target';
import { isLockedVanilla } from '../scope-lock';
import { planItemLabel } from '../plan-item-label';
import { targetLocalIdOf } from '../plan-target-id';
import { lockedVanillaRow } from './locked-vanilla-row';
import { npcGrantOf } from './npc-grant-of';
import type { CheckId } from '@rotp/game-data';
import type { ItemKey } from '../../world/item-ids';
import type { LocationKey } from '../../world/location-key';
import type { ScopeFlags } from '../scope-lock';
import type { PlanEntry, PlanError } from '../physical-plan.type';

const classifyLocation = (
  location: LocationKey, item: ItemKey, flags: ScopeFlags,
): PlanEntry | PlanError => {
  const checkId = checkIdOfLocation(location);
  const detection = checkId !== undefined
    ? withProgressBaseline(detectionOf(checkId), flags.capacityStartTiers?.get(location))
    : null;
  const detectionField = detection !== null ? { detection } : {};

  if (isLockedVanilla(location, flags)) return lockedVanillaRow(location, item, flags, checkId, detection);
  const targetLocalId = targetLocalIdOf(item);
  if (targetLocalId === undefined) {
    return { location, item, reason: `assigned item is unresolvable: ${planItemLabel(item)}` };
  }
  const shopKey = shopOverrideKeyOf(location, flags.shops, flags.shopPrices);
  if (shopKey !== null) {
    return {
      location, item, planClass: 'override-shop', ...detectionField,
      shopOverride: { ...shopKey, targetLocalId },
    };
  }
  const pondTarget = pondPrizeTargetOf(location, flags);
  if (pondTarget !== null) {
    return {
      location, item, planClass: 'override-scripted',
      ...(checkId !== undefined ? { checkId } : {}),
      scriptedOverride: { target: pondTarget, targetLocalId },
    };
  }
  if (checkId === undefined) {
    return { location, item, reason: 'no check record for this location' };
  }
  const { kind, gameId } = getCheck(checkId);
  if (kind === 'chest' && gameId.roomId !== undefined && gameId.chestIndex !== undefined) {
    if (detection === null) {
      return { location, item, reason: 'check record has no usable detection' };
    }
    return {
      location, item, checkId, planClass: 'override', detection,
      target: { roomId: gameId.roomId, chestIndex: gameId.chestIndex, targetLocalId },
    };
  }
  const scriptedKey = scriptedOverrideKeyOf(checkId);
  if (scriptedKey !== null) {
    return {
      location, item, checkId, planClass: 'override-scripted', ...detectionField,
      scriptedOverride: { target: scriptedKey, targetLocalId },
    };
  }
  const freestandingKey = freestandingKeyDropOf(checkId);
  if (freestandingKey !== null) {
    return {
      location, item, checkId, planClass: 'override-drop', ...detectionField,
      dropOverride: { ...freestandingKey, targetLocalId },
    };
  }
  const standingKey = standingOverrideKeyOf(checkId);
  if (standingKey !== null) {
    return {
      location, item, checkId, planClass: 'override-standing', ...detectionField,
      standingOverride: { ...standingKey, targetLocalId },
    };
  }
  const npcKey = npcOverrideKeyOf(checkId);
  if (npcKey !== null) {
    return {
      location, item, checkId, planClass: 'override-npc', ...detectionField,
      npcOverride: { ...npcKey, targetLocalId },
    };
  }
  if (kind === 'keyDrop' && gameId.roomId !== undefined) {
    const big = isBigKeyDrop(checkId);
    return {
      location, item, checkId, planClass: 'override-drop', ...detectionField,
      dropOverride: { roomId: gameId.roomId, big, targetLocalId },
    };
  }
  if (detection === null) {
    return { location, item, reason: 'check record has no usable detection' };
  }
  const npcGrant = npcGrantOf(checkId);
  return {
    location, item, checkId, planClass: 'deliver', detection, targetLocalId,
    ...(npcGrant !== undefined ? { npcGrant } : {}),
  };
};

export { classifyLocation };
