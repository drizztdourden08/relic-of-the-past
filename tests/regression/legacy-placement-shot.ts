/* @layer test @kind helper */
/**
 * Reads a placement a snapshot stored before the engine keyed by id.
 *
 * A snapshot older than step 10c holds `nameView`, and its locations, its items and its spheres
 * are all names. The gate compares placements by ID, because that is the only comparison a
 * relabel cannot move, so an older baseline is read into those keys here. Nothing in the app
 * uses this: it exists so a baseline taken before the change is still usable, and it goes the
 * day a fresh floor is taken.
 *
 * A name a record no longer answers to is passed through `renamed`, which is the gate's own
 * declared-rename table, and a check that stands for a shelf's first stock is read as that
 * stock's shop key. The two kinds of row no record ever covered are derived instead: a shelf's
 * restock from its shelf's check, and a pond rung from its pond.
 */
import { itemKeyOfName } from '@shared/randomizer/world/display-names/item-key-name';
import { CAPACITY_SHOP_EVENT, pondRungKey } from '@shared/randomizer/world/location-key';
import { locationKeyOfCheck } from '@shared/randomizer/world/location-record';
import { POND_INSTANCES } from '@shared/randomizer/world/pond/pond-instances';
import { shopPurchaseKeyOfCheck } from '@shared/randomizer/world/shops/shop-slots';
import type { LocationKey } from '@shared/randomizer/world/location-key';

interface LegacyShot {
  seed: string;
  medallions: { mire: string; turtleRock: string };
  nameView?: Record<string, string>;
  shopPrices?: Record<string, unknown>;
  pondDemands?: Record<string, unknown>;
  spheres: { index: number; locations: string[] }[];
  stats: unknown;
}

const ORDINALS: Readonly<Record<string, number>> = { '2nd': 2, '3rd': 3, '4th': 4, '5th': 5 };
const POND_BY_LABEL: ReadonlyMap<string, string> = new Map(POND_INSTANCES.map((pond) => [pond.label, pond.id]));

/** The key the engine gives the location a pre-10c snapshot called |name|. */
const keyOfLegacyName = (
  name: string, idByName: ReadonlyMap<string, string>, renamed: (old: string) => string,
): LocationKey => {
  const direct = idByName.get(renamed(name));
  if (direct !== undefined) return locationKeyOfCheck(direct);
  if (name === 'Capacity Upgrade Shop') return CAPACITY_SHOP_EVENT;
  const restock = /^(.*) \((2nd|3rd|4th|5th)\)$/.exec(name);
  const shelf = restock === null ? undefined : idByName.get(restock[1]);
  const purchase = restock === null || shelf === undefined
    ? undefined : shopPurchaseKeyOfCheck(shelf, ORDINALS[restock[2]]);
  if (purchase !== undefined) return purchase;
  const rung = /^(.*) (\d+)$/.exec(name);
  const pond = rung === null ? undefined : POND_BY_LABEL.get(rung[1]);
  if (rung !== null && pond !== undefined) return pondRungKey(pond, Number(rung[2]));
  return name as LocationKey;
};

/**
 * One snapshot's placement in the shape the engine writes now. A placement already keyed by id
 * is handed straight back, so this only ever rewrites an older baseline.
 */
const placementByKey = (
  placement: unknown, idByName: ReadonlyMap<string, string>, renamed: (old: string) => string,
): unknown => {
  const shot = placement as LegacyShot;
  if (shot.nameView === undefined) return placement;
  const keyed = (name: string): LocationKey => keyOfLegacyName(name, idByName, renamed);
  const remap = (view: Record<string, unknown>): Record<string, unknown> =>
    Object.fromEntries(Object.entries(view).map(([name, value]) => [keyed(name), value]));
  return {
    seed: shot.seed,
    medallions: {
      mire: itemKeyOfName(shot.medallions.mire),
      turtleRock: itemKeyOfName(shot.medallions.turtleRock),
    },
    locations: Object.fromEntries(
      Object.entries(shot.nameView).map(([name, item]) => [keyed(name), itemKeyOfName(item)]),
    ),
    ...(shot.shopPrices === undefined ? {} : { shopPrices: remap(shot.shopPrices) }),
    ...(shot.pondDemands === undefined ? {} : { pondDemands: remap(shot.pondDemands) }),
    spheres: shot.spheres.map((sphere) => ({ index: sphere.index, locations: sphere.locations.map(keyed) })),
    stats: shot.stats,
  };
};

export { placementByKey };
