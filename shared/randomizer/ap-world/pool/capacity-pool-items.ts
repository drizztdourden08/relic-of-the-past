/* @layer shared-game @kind logic */
/**
 * The capacity items a profile puts in the pool. The counted families and
 * the wallet contribute their plan's items on top of the reference rows; a
 * fairy slot that exists but is locked vanilla keeps its vanilla one-tier
 * item, so one such item leaves the family's items when it holds one (the
 * npc-scope mechanism); when it holds none the locked slot delivers
 * its vanilla upgrade for free and the items stay. The meter's first items
 * REPLACE the reference's fixed magic row (pool-tables.data.ts), padded back
 * to its length so the 153-item invariant holds; every further meter item
 * (a ladder opens with the empty rung, so a plan can carry one item per
 * level) enters the pool the way the other families' items do, displacing
 * filler. A locked meter spot needs its vanilla half-meter item somewhere in
 * the pool for the scope subtraction to find.
 */
import { CAPACITY_UPGRADE_LOCATIONS } from '../special-locations.data';
import { familyOfSpot } from '../capacity/capacity-spots';
import { MAGIC_ITEMS } from './pool-tables.data';
import type { CapacityFamilyId, FamilyPlan } from '../capacity/capacity-profile.type';

type Plans = Readonly<Record<CapacityFamilyId, FamilyPlan>>;

/** Where the meter plan's items go: the reference row, then the pool like any other family's items. */
interface MeterPoolItems {
  /** Exactly the reference row's length: the plan's first items, padded with the row's filler. */
  magicRow: string[];
  /** The plan's remaining items: each displaces one filler, like an explosives or wallet item. */
  overflow: string[];
}

const removeOne = (items: string[], name: string): void => {
  const index = items.indexOf(name);
  if (index !== -1) items.splice(index, 1);
};

/** Explosives, projectiles and wallet items, minus a locked slot's vanilla one-tier item. */
const capacityPoolItems = (plans: Plans, lockedSpots: ReadonlySet<string>): string[] => {
  const perFamily: Record<CapacityFamilyId, string[]> = {
    explosives: [...plans.explosives.items],
    projectiles: [...plans.projectiles.items],
    meter: [],
    wallet: [...plans.wallet.items],
  };
  for (const [location, vanillaItem] of CAPACITY_UPGRADE_LOCATIONS) {
    const family = familyOfSpot(location);
    if (family !== undefined && lockedSpots.has(location)) removeOne(perFamily[family], vanillaItem);
  }
  return [...perFamily.explosives, ...perFamily.projectiles, ...perFamily.wallet];
};

/**
 * The meter plan's items split between the magic row and the overflow. A
 * locked meter spot keeps its vanilla half-meter item, which must be present
 * for the scope lock to remove, appended when the plan carries none.
 */
const meterPoolItemsOf = (meterItems: readonly string[], meterSpotLocked: boolean): MeterPoolItems => {
  const [vanillaItem, padding] = MAGIC_ITEMS;
  const items = [...meterItems];
  if (meterSpotLocked && !items.includes(vanillaItem)) items.push(vanillaItem);
  const magicRow = items.slice(0, MAGIC_ITEMS.length);
  while (magicRow.length < MAGIC_ITEMS.length) magicRow.push(padding);
  return { magicRow, overflow: items.slice(MAGIC_ITEMS.length) };
};

export { capacityPoolItems, meterPoolItemsOf };
export type { MeterPoolItems };
