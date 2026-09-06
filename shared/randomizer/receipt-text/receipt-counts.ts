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
import { isProgressiveCapacityItemName } from '@shared/game/data/capacity-progressive-item';
import { BOTTLE_ITEMS, CRYSTAL_ITEMS, ITEM } from '../ap-world/item-names.data';
import { PRIZE_ITEMS } from '../ap-world/pool/event-items.data';
import { KEY_DROP_LOCATIONS } from '../ap-world/special-locations.data';

const SMALL_KEY_RE = /^Small Key \((.+)\)$/;
const PROGRESSIVE_PREFIX = 'Progressive ';

const BOTTLES = new Set(BOTTLE_ITEMS);
const CRYSTALS = new Set(CRYSTAL_ITEMS);
const PENDANTS = new Set(PRIZE_ITEMS.filter((name) => !CRYSTALS.has(name)));

/** The class an item name is counted under, or undefined for an uncounted item. */
const countClassOf = (itemName: string): string | undefined => {
  const smallKey = SMALL_KEY_RE.exec(itemName);
  if (smallKey !== null) return `small-key:${smallKey[1]}`;
  if (itemName === ITEM.pieceOfHeart) return 'heart-piece';
  if (itemName === ITEM.bossHeartContainer || itemName === ITEM.sanctuaryHeartContainer) return 'heart-container';
  if (BOTTLES.has(itemName)) return 'bottle';
  if (CRYSTALS.has(itemName)) return 'crystal';
  if (PENDANTS.has(itemName)) return 'pendant';
  if (itemName === ITEM.triforcePiece) return 'triforce';
  if (itemName.startsWith(PROGRESSIVE_PREFIX) && !isProgressiveCapacityItemName(itemName)) return `progressive:${itemName}`;
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
  /** Location → item, every location of the seed. */
  nameView: Readonly<Record<string, string>>;
  keyDropShuffle: boolean;
  /** Completed locations, by the same names. */
  completed: ReadonlySet<string>;
  triforceRequired?: number;
}

/** location → its count, or undefined for an uncounted (or excluded) location. */
type ReceiptCountOf = (location: string) => ReceiptCount | undefined;

const receiptCountsOf = (source: ReceiptCountSource): ReceiptCountOf => {
  const { nameView, keyDropShuffle, completed, triforceRequired } = source;
  const classByLocation = new Map<string, string>();
  const totals = new Map<string, number>();
  const found = new Map<string, number>();
  for (const [location, itemName] of Object.entries(nameView)) {
    if (!keyDropShuffle && KEY_DROP_LOCATIONS.has(location)) continue;
    const countClass = countClassOf(itemName);
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
