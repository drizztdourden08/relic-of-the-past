/* @layer renderer-lib @kind logic */
/**
 * A stored placement read under today's pond names.
 *
 * Two renames land here. Every pond's rungs used to be numbered under a name
 * for what the pond DOES (Capacity Upgrade Pond 3), and they are numbered
 * under the fairy's own name now (Hylia Fairy 3); that one applies whatever
 * the pond was set to. The capacity pond's two native slots were also briefly
 * named after the family each grows, and which name they become depends on
 * what the pond was: a legacy pond's two are the capacity families' own fairy
 * slots, any other mode's are the first two rungs of the prize ladder. The
 * other two ponds' native slots are named by Archipelago and always were, so
 * nothing of theirs is renamed.
 *
 * A LOCATION NAME IS STORED IN FOUR PLACES, and every one of them is rewritten
 * here: the `nameView` keys, the sweep spheres, the `pondDemands` keys and the
 * `shopPrices` keys. Rewriting the first two alone is what shipped once, and a
 * seed frozen under the old rung names then found no demand at any rung and
 * asked the player for nothing, because a missing demand reads as no demand.
 * Anything added to ApPlacement that is keyed by a location name belongs in
 * this list; nothing under `stats` is, since every map there is keyed by a
 * family or a dungeon.
 */
import { LEGACY_CAPACITY_SPOT_NAMES } from '@shared/randomizer/ap-world/capacity/capacity-spots.data';
import {
  LEGACY_POND_RUNG_NAMES, REFERENCE_CAPACITY_POND_SLOT_NAMES,
} from '@shared/randomizer/ap-world/pond/pond-locations.data';
import { pondProfilesOfStats } from '@shared/randomizer/ap-world/fill/placement-ponds';
import type { ApPlacement } from '@shared/randomizer/ap-world/fill/ap-placement.type';

/** Every pond location a frozen placement can carry under a name it no longer answers to. */
const renamedPondNames = (placement: ApPlacement): ReadonlyMap<string, string> => {
  const legacyPond = pondProfilesOfStats(placement.stats).capacity.mode === 'capacity';
  const slots = legacyPond ? LEGACY_CAPACITY_SPOT_NAMES : REFERENCE_CAPACITY_POND_SLOT_NAMES;
  return new Map([...LEGACY_POND_RUNG_NAMES, ...slots]);
};

type NameOf = (location: string) => string;

/** One location-keyed map under today's names; absent stays absent. */
const renameKeys = <T>(
  view: Readonly<Record<string, T>> | undefined, nameOf: NameOf,
): Readonly<Record<string, T>> | undefined => (view === undefined
  ? undefined
  : Object.fromEntries(Object.entries(view).map(([location, value]) => [nameOf(location), value])));

/** Whether any stored location name is one this build no longer answers to. */
const carriesOldNames = (placement: ApPlacement, renamed: ReadonlyMap<string, string>): boolean => {
  const { nameView, pondDemands, shopPrices, spheres } = placement;
  const keys = [...Object.keys(nameView), ...Object.keys(pondDemands ?? {}), ...Object.keys(shopPrices ?? {})];
  return keys.some((location) => renamed.has(location))
    || spheres.some((sphere) => sphere.locations.some((location) => renamed.has(location)));
};

const renamePondLocations = (placement: ApPlacement): ApPlacement => {
  const renamed = renamedPondNames(placement);
  if (!carriesOldNames(placement, renamed)) return placement;
  const nameOf: NameOf = (location) => renamed.get(location) ?? location;
  const pondDemands = renameKeys(placement.pondDemands, nameOf);
  const shopPrices = renameKeys(placement.shopPrices, nameOf);
  return {
    ...placement,
    nameView: renameKeys(placement.nameView, nameOf) as Record<string, string>,
    ...(pondDemands === undefined ? {} : { pondDemands }),
    ...(shopPrices === undefined ? {} : { shopPrices }),
    spheres: placement.spheres.map((sphere) => ({ ...sphere, locations: sphere.locations.map(nameOf) })),
  };
};

export { renamePondLocations };
