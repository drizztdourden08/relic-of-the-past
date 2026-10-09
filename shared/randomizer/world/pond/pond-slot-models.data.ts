/* @layer shared-game @kind data */
import { ITEM } from '../item-ids.data';
import type { PondSlotModel } from './pond.type';

const POND_SLOT_MODELS: Readonly<Record<string, PondSlotModel>> = {
  'check-273': { lock: { kind: 'hard', family: 'explosives' } },
  'check-274': { lock: { kind: 'hard', family: 'projectiles' } },
  'check-021': { lock: { kind: 'none' }, vanillaGrant: ITEM.redBoomerang },
  'check-022': { lock: { kind: 'tier', family: 'shield', tier: ITEM.redShield }, vanillaGrant: ITEM.progressiveShield },
  'check-266': { lock: { kind: 'tier', family: 'sword', tier: ITEM.goldenSword }, vanillaGrant: ITEM.progressiveSword },
  'check-267': { lock: { kind: 'tier', family: 'bow', tier: ITEM.silverBow }, vanillaGrant: ITEM.progressiveBow },
};

export { POND_SLOT_MODELS };
