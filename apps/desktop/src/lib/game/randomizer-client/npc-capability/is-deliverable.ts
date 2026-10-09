/* @layer bridge-wasm @kind logic */
import { isSlotKey } from '@shared/randomizer/world/location-key';
import type { CheckId, ItemId } from '@rotp/game-data';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import { itemKeyName } from '@shared/randomizer/world/display-names/item-key-name';
import { detectionOf } from '../check-detection';
import { freestandingKeyDropOf } from '../freestanding-key-drops';
import { npcOverrideKeyOf } from '../npc-override-key';
import { scriptedOverrideKeyOf } from '../scripted-override-key';
import { standingOverrideKeyOf } from '../standing-override-key';
import { resolveServerItemLocalId } from '../online-items';

const hasSubstitutionKey = (checkId: CheckId): boolean =>
  scriptedOverrideKeyOf(checkId) !== null
  || freestandingKeyDropOf(checkId) !== null
  || standingOverrideKeyOf(checkId) !== null
  || npcOverrideKeyOf(checkId) !== null;

const isDeliverable = (location: LocationKey, vanillaItem: ItemId): boolean => {
  if (isSlotKey(location)) return false;
  const checkId = location;
  if (resolveServerItemLocalId(itemKeyName(vanillaItem)) === undefined) return false;
  if (hasSubstitutionKey(checkId as CheckId)) return true;
  return detectionOf(checkId) !== null;
};

export { isDeliverable };
