/* @layer shared-game @kind types */
/**
 * What one fairy pond IS, apart from what a player sets it to. The game has
 * three of them and they share a single behaviour: a fairy rises out of the
 * water, takes what is thrown in, and hands something back. They differ in
 * the room they sit in, the two grants they carry in the unmodified game, and
 * what those grants are the only source of.
 *
 * The lock is that last question, and it is the one the settings cannot
 * ignore: a slot the game is the ONLY native source of cannot be emptied
 * without leaving a hole in the seed. A hard lock names a capacity family,
 * whose upgrades exist nowhere else at all; a tier lock names a progressive
 * family and the rung this pond hands over, which the pool can carry instead;
 * and a slot with no lock hands over a discrete item the pool already holds a
 * copy of, so nothing is stranded by taking it.
 */
import type { CapacityFamilyId } from '../capacity/capacity-profile.type';
import type { ProgressiveFamilyId } from '../progressive/progressive.type';

/** The three ponds, by the name this app addresses each one with. */
type PondId = 'capacity' | 'wishing' | 'cursed';

/** The two capacity families a pond is the game's only native source of. */
type PondHardFamily = Extract<CapacityFamilyId, 'explosives' | 'projectiles'>;

/**
 * What a slot is the native source of: a whole capacity family (hard), one
 * rung of a tiered family (tier, named as the reference names the item), or
 * nothing that can be stranded (none).
 */
type PondSlotLock =
  | { kind: 'hard'; family: PondHardFamily }
  | { kind: 'tier'; family: ProgressiveFamilyId; tier: string }
  | { kind: 'none' };

/** One of the two grants a pond carries in the unmodified game. */
interface PondSlot {
  /**
   * The slot's identity: Archipelago's own location name, which is what a
   * server sends and the only string it answers to. A player never reads this
   * one, because display-names/pond-display-name.ts numbers it under the
   * pond's own name instead.
   */
  location: string;
  /**
   * The tier ladder this slot heads, when the pond sells one ladder per
   * answer. The capacity pond does: its bomb answer and its arrow answer each
   * climb seven purchases, so the slot is rung 1 of that family's ladder and
   * not the pond's Nth prize. Absent at a pond whose slots are plain prizes.
   */
  ladder?: string;
  lock: PondSlotLock;
  /**
   * The pool item her upgrade PRODUCES at this slot, which is what a wish pond at
   * Vanilla grants locks here (pond-vanilla-slots.ts). Never the item she takes
   * in trade, which the player still has to find. Absent at the capacity pond,
   * whose pair the capacity families decide.
   */
  vanillaGrant?: string;
}

/** One pond: where it is, what it is called, and what it hands over. */
interface PondInstance {
  id: PondId;
  /** The game's room number, so a screen lookup never needs a hardcoded name. */
  room: number;
  /**
   * The one name a player reads for this pond: the options panel's tab, and
   * the stem of every slot it holds ("<label> 1", "<label> 2", and on up a
   * custom pond's ladder).
   */
  label: string;
  slots: readonly [PondSlot, PondSlot];
}

export type { PondHardFamily, PondId, PondInstance, PondSlot, PondSlotLock };
