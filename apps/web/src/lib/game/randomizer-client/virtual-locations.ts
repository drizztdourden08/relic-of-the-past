/* @layer bridge-wasm @kind logic */
/**
 * Synthesizes tracker-facing CheckRecord-shaped entries for every world
 * location this seed placed an item at that no real CheckRecord backs (shop
 * shelves at every restock depth, chiefly). Built fresh per placement so the
 * widget's total always matches exactly what THIS seed generated, never a
 * smaller fixed dataset that silently drops whole categories.
 *
 * A virtual record carries no gameId (there is nothing to poll: its status
 * comes from the availability engine and the fire-id ledger, both already
 * keyed by the raw world location name), and `kind: 'npc'` is a placeholder
 * class for the "type" facet, not a detection claim. vanillaItemIds carries
 * the real vanilla item where one exists (a shop shelf, a key-drop pot);
 * everything here still hands over a real item, so isGuaranteedReward says so
 * even where there is no vanilla precedent to point vanillaItemIds at (a pond
 * prize rung).
 *
 * The reference's logic events stay: beating Agahnim, opening the floodgate,
 * getting the frog and the rest are things the player DOES, the game writes a
 * flag for each, and every one has a check record of its own here.
 * UNTRACKED_LOCATIONS is the exception that has none.
 */
import { shopSlotLocationOf } from '@shared/randomizer/world/shops/shop-slots';
import { EVENT_LOCATIONS, KEY_DROP_LOCATIONS } from '@shared/randomizer/world/scope-tables';
import { CAPACITY_SHOP_EVENT, isSlotKey } from '@shared/randomizer/world/location-key';
import { locationDisplayName } from '@shared/randomizer/world/display-names/location-display-name';
import { getCheck } from '@shared/game/data';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { CheckId, CheckRecord, ItemId, ScreenId } from '@shared/game/data';

/**
 * The screen a restock rides on: its own slot's record says which shop interior it is in,
 * which is what the world and area grouping reads.
 */
const shopScreenFor = (location: LocationKey): ScreenId | undefined => {
  const checkId = shopSlotLocationOf(location)?.slot.checkId;
  return checkId === undefined ? undefined : getCheck(checkId).screenId;
};

/**
 * Placement locations the tracker does not list, because there is nothing at them to track.
 *
 * "Capacity Upgrade Shop" is Archipelago's own event (its spoilers carry it), but unlike
 * every other event it stands for no act of the player and the game writes no flag for it:
 * it fires on reaching the pond's room, and the token only tells the fill's solver that a
 * vanilla capacity family can be bought up from there (state-helpers-capacity.ts). It is
 * the one event with no check record here, for exactly that reason.
 */
const UNTRACKED_LOCATIONS: ReadonlySet<LocationKey> = new Set([CAPACITY_SHOP_EVENT]);

const slugOf = (name: string): string => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** A virtual location's own vanilla item, when it has one (a shop shelf or a key-drop pot). */
const vanillaItemIdsOf = (location: LocationKey): ItemId[] => {
  const itemId = shopSlotLocationOf(location)?.slot.vanillaItem ?? KEY_DROP_LOCATIONS.get(location);
  return itemId === undefined ? [] : [itemId];
};

/** The synthetic id a virtual check gets for a given world location name. Shared
 * with placement-view.ts so a virtual check's row and its placed-item lookup
 * can never drift onto two different ids for the same location. */
const VIRTUAL_PREFIX = 'check-virtual-';

const virtualCheckIdOf = (location: LocationKey): CheckId => `${VIRTUAL_PREFIX}${slugOf(location)}` as CheckId;

/** The location a virtual check stands for: a key is already slug-shaped, so this is exact. */
const virtualLocationOf = (checkId: string): LocationKey => checkId.slice(VIRTUAL_PREFIX.length) as LocationKey;

/** One cache slot: placements don't change mid-session, and this only ever runs against the active one. */
let cached: { placement: Placement; records: CheckRecord[] } | null = null;

/**
 * Every location in the placement's locations with no real CheckId, as a
 * plain CheckRecord the grouping/filter/stats code (all generic over
 * CheckRecord fields) already knows how to render without any changes.
 */
const virtualChecksOf = (placement: Placement): CheckRecord[] => {
  if (cached?.placement === placement) return cached.records;
  const records: CheckRecord[] = [];
  for (const where of Object.keys(placement.locations)) {
    const location = where as LocationKey;
    if (UNTRACKED_LOCATIONS.has(location) || !isSlotKey(location)) continue;
    const screenId = shopScreenFor(location);
    records.push({
      id: virtualCheckIdOf(location),
      gameId: {},
      kind: 'npc',
      screenId,
      name: locationDisplayName(location),
      vanillaItemIds: vanillaItemIdsOf(location),
      isGuaranteedReward: !EVENT_LOCATIONS.has(location),
    });
  }
  cached = { placement, records };
  return records;
};

/**
 * The check roster for a randomized session: every real CheckRecord this
 * seed's own placement actually names, plus a virtual one for every location
 * none of them cover. A handful of our checks (the intro's own story beats:
 * "Link Wakes Up", "Rescued Zelda") track real vanilla progress but were
 * never world locations at all, so counting them here would inflate the
 * total past what the seed actually generated; they stay in the base
 * checkRecords array untouched for the normal profile that DOES want them.
 */
const placementCheckRecords = (checkRecords: readonly CheckRecord[], placement: Placement): CheckRecord[] => {
  const real = checkRecords.filter((check) => placement.locations[check.id] !== undefined);
  return [...real, ...virtualChecksOf(placement)];
};

/**
 * The event records: shown on every profile, never part of a seed's total. Three of them are
 * also locations of the world (the flute spot, the floodgate, the smiths' ruins), so this list
 * and the aligned one overlap and whoever joins them deduplicates by id
 * (tracker/tracker-roster.ts).
 */
const eventCheckRecords = (checkRecords: readonly CheckRecord[]): CheckRecord[] =>
  checkRecords.filter((check) => check.kind === 'event');

export { placementCheckRecords, eventCheckRecords, virtualChecksOf, virtualCheckIdOf, virtualLocationOf };
