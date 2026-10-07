/* @layer shared-game @kind logic */
/**
 * What a player reads for one fairy pond slot.
 *
 * A pond slot has two names and they answer different questions. Its LOCATION
 * is Archipelago's own string, the identity a server addresses it by, and four
 * of the six spell a side the game does not have (Waterfall Fairy - Left,
 * Capacity Upgrade Right). Renaming those costs the slot its place in every
 * online session, because the server has no location by the new name, so they
 * stay exactly as Archipelago writes them.
 *
 * The name a person reads is this one instead: the pond, then the slot's
 * number. A pond hands its grants over one after another, so a number is what
 * a slot really is, and the same numbering runs on up a custom pond's ladder,
 * whose rungs are named that way already (pond/pond-locations.data.ts). One
 * continuous series per pond either way, because the two never coexist: a
 * pond with rungs is a pond whose native pair is not a location.
 *
 * The capacity pond names its family, because it answers in two ladders of
 * seven and not in single prizes, and its two native slots are rung 1 of
 * each. That word also keeps the two series apart: the pond's prize rungs
 * are "Hylia Fairy N" with nothing between, so a bare number here would put a
 * tier and a rung under one name.
 *
 * An unknown name comes straight back, which is what makes this safe to put in
 * front of any location name at all: a chest, a shop shelf, a rung.
 */
import { POND_INSTANCES } from '../pond/pond-instances.data';
import type { PondInstance, PondSlot } from '../pond/pond-instance.type';

/** The pond and the number this slot is: rung 1 of its own ladder, or the pond's Nth prize. */
const slotDisplayNameOf = (pond: PondInstance, slot: PondSlot, index: number): string =>
  (slot.ladder === undefined ? `${pond.label} ${index + 1}` : `${pond.label} ${slot.ladder} 1`);

/** Each pond slot's Archipelago name, mapped to the name a player reads. */
const POND_SLOT_DISPLAY_NAMES: ReadonlyMap<string, string> = new Map(
  POND_INSTANCES.flatMap((pond) => pond.slots.map(
    (slot, index) => [slot.location, slotDisplayNameOf(pond, slot, index)] as [string, string],
  )),
);

/** The name to show for one location; anything but a pond slot is handed back unchanged. */
const locationDisplayName = (location: string): string =>
  POND_SLOT_DISPLAY_NAMES.get(location) ?? location;

export { POND_SLOT_DISPLAY_NAMES, locationDisplayName };
