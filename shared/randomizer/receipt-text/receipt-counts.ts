/* @layer shared-game @kind logic */
/**
 * The found/total numbers of a seed's countable items. A count class groups
 * the copies of one thing the player collects several of (a palace's small
 * keys, the heart pieces, the bottles, the crystals) and the seed's own
 * placement fixes the total per class. "Found so far" is a tracker fact: the
 * completed locations, whichever copies they held. The ordinal of a location
 * is one more than the OTHER completed locations of its class, so a line
 * reads the same before and after its own location completes, so the renderer
 * re-composes on every tracker change without ever showing k+1 for the copy
 * being received. Key drops count only under key-drop shuffle: with it off
 * they stay vanilla pickups the tracker never sees.
 */
import { getItem } from '@shared/game/data';
import { isProgressiveCapacityItemName } from '@shared/game/data/capacity-progressive-item';
import { familyOfDungeonItem } from '../world/dungeon-items/dungeon-item-modes';
import { itemKeyName } from '../world/display-names/item-key-name';
import type { ItemKey } from '../world/item-ids.data';
import type { LocationKey } from '../world/location-key';
import { BOTTLE_ITEMS, CRYSTAL_ITEMS } from '../world/item-groups';
import { ITEM } from '../world/item-ids.data';
import { PRIZE_ITEMS } from '../world/pool/event-items.data';
import { KEY_DROP_LOCATIONS } from '../world/scope-tables';

const PROGRESSIVE_PREFIX = 'Progressive ';

const BOTTLES: ReadonlySet<ItemKey> = new Set<ItemKey>(BOTTLE_ITEMS);
const CRYSTALS: ReadonlySet<ItemKey> = new Set<ItemKey>(CRYSTAL_ITEMS);
const PENDANTS: ReadonlySet<ItemKey> = new Set<ItemKey>(PRIZE_ITEMS.filter((item) => !CRYSTALS.has(item)));

/** The class an item is counted under, or undefined for an uncounted item. */
const countClassOf = (item: ItemKey): string | undefined => {
  const family = familyOfDungeonItem(item);
  if (family === 'smallKey') return `small-key:${getItem(item).dungeonId ?? item}`;
  if (item === ITEM.pieceOfHeart) return 'heart-piece';
  if (item === ITEM.bossHeartContainer || item === ITEM.sanctuaryHeartContainer) return 'heart-container';
  if (BOTTLES.has(item)) return 'bottle';
  if (CRYSTALS.has(item)) return 'crystal';
  if (PENDANTS.has(item)) return 'pendant';
  if (item === ITEM.triforcePiece) return 'triforce';
  const name = itemKeyName(item);
  if (name.startsWith(PROGRESSIVE_PREFIX) && !isProgressiveCapacityItemName(name)) return `progressive:${item}`;
  return undefined;
};

/** The numbers one location's line shows. */
interface ReceiptCount {
  /** This copy's rank among the class: found so far + 1. */
  ordinal: number;
  /** The seed's copies of the class. */
  total: number;
  /** The goal's requirement, for a triforce piece; absent = no such goal. */
  required?: number;
}

interface ReceiptCountSource {
  /** What every location of the seed holds. */
  locations: Readonly<Record<LocationKey, ItemKey>>;
  keyDropShuffle: boolean;
  /** The locations already taken. */
  completed: ReadonlySet<LocationKey>;
  triforceRequired?: number;
}

/** A location's count, or undefined for an uncounted (or excluded) one. */
type ReceiptCountOf = (location: LocationKey) => ReceiptCount | undefined;

const receiptCountsOf = (source: ReceiptCountSource): ReceiptCountOf => {
  const { locations, keyDropShuffle, completed, triforceRequired } = source;
  const classByLocation = new Map<LocationKey, string>();
  const totals = new Map<string, number>();
  const found = new Map<string, number>();
  for (const [where, item] of Object.entries(locations)) {
    const location = where as LocationKey;
    if (!keyDropShuffle && KEY_DROP_LOCATIONS.has(location)) continue;
    const countClass = countClassOf(item);
    if (countClass === undefined) continue;
    classByLocation.set(location, countClass);
    totals.set(countClass, (totals.get(countClass) ?? 0) + 1);
    if (completed.has(location)) found.set(countClass, (found.get(countClass) ?? 0) + 1);
  }
  return (location) => {
    const countClass = classByLocation.get(location);
    if (countClass === undefined) return undefined;
    const others = (found.get(countClass) ?? 0) - (completed.has(location) ? 1 : 0);
    const count: ReceiptCount = { ordinal: others + 1, total: totals.get(countClass) ?? 0 };
    return countClass === 'triforce' && triforceRequired !== undefined ? { ...count, required: triforceRequired } : count;
  };
};

export { countClassOf, receiptCountsOf };
export type { ReceiptCount, ReceiptCountOf, ReceiptCountSource };
