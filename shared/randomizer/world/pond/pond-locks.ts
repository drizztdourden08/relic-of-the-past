/* @layer shared-game @kind logic */
/**
 * THE RANDOMIZER'S MODEL of each pond slot, keyed by the slot's own check id.
 *
 * Neither half of this is a fact about the game. The LOCK is this generator's reading of
 * what a slot is the only native source of, which is what decides whether emptying it would
 * leave a hole in the seed: a hard lock names a capacity family whose upgrades exist nowhere
 * else at all, a tier lock names a progressive family and the rung this pond hands over,
 * which the pool can carry instead, and no lock means the pool already holds a copy of what
 * the slot gives. The GRANT is the pool item the slot's upgrade produces, in the pool's own
 * words, which is what a wish pond at Vanilla locks into the slot (pond-vanilla-slots.ts).
 * Never the item she takes in trade, which the player still has to find.
 *
 * What each slot IS, where it sits and what number it carries lives on its check record.
 */
import { ITEM } from '../item-ids.data';
import type { CheckId, ItemId } from '@shared/game/data';
import type { PondSlotLock } from './pond-instance.type';

interface PondSlotModel {
  lock: PondSlotLock;
  /** The pool item this slot's upgrade produces; absent where a family decides it. */
  vanillaGrant?: ItemId;
}

const POND_SLOT_MODELS: Readonly<Record<string, PondSlotModel>> = {
  // The capacity pond's pair: the game's ONLY source of either family, so both are locked
  // hard, and which upgrade each hands over is the capacity families' business.
  'check-273': { lock: { kind: 'hard', family: 'explosives' } },
  'check-274': { lock: { kind: 'hard', family: 'projectiles' } },
  // The wishing water. She takes the blue boomerang and hands back the red one, which is two
  // discrete pool items and never a ladder, so nothing can be stranded by taking that slot.
  'check-021': { lock: { kind: 'none' }, vanillaGrant: ITEM.redBoomerang },
  'check-022': { lock: { kind: 'tier', family: 'shield', tier: ITEM.redShield }, vanillaGrant: ITEM.progressiveShield },
  // The cursed water: the top rung of each of those two families.
  'check-266': { lock: { kind: 'tier', family: 'sword', tier: ITEM.goldenSword }, vanillaGrant: ITEM.progressiveSword },
  'check-267': { lock: { kind: 'tier', family: 'bow', tier: ITEM.silverBow }, vanillaGrant: ITEM.progressiveBow },
};

const pondSlotModelOf = (checkId: CheckId): PondSlotModel =>
  POND_SLOT_MODELS[checkId] ?? { lock: { kind: 'none' } };

export { POND_SLOT_MODELS, pondSlotModelOf };
export type { PondSlotModel };
