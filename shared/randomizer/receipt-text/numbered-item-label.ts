/* @layer shared-game @kind logic */
/**
 * The item label of a receipt line, numbered when the seed can count it:
 * "Small Key of Eastern Palace (2 of 4)", "Piece of Heart (3 of 4 to a
 * heart, 7 of 24)", "Sword tier 2 of 4", "Bottle (2 of 4)", "Crystal 3
 * (3 of 7)", "Triforce Piece (12 of 20, 30 available)". A dungeon item names
 * its dungeon in every case; the other numbers appear only with a count
 * (an online receipt has no seed to count from and shows the plain name).
 * The names themselves come from the placement data, never from here.
 */
import { countClassOf } from './receipt-counts';
import type { ReceiptCount } from './receipt-counts';

const DUNGEON_ITEM_RE = /^(Small Key|Big Key|Map|Compass) \((.+)\)$/;
const PROGRESSIVE_PREFIX = 'Progressive ';
const PIECES_PER_HEART = 4;

const ofTotal = (count: ReceiptCount): string => `(${count.ordinal} of ${count.total})`;

/**
 * The quarter this piece is, then the seed's count: "(2 of 4 to a heart, 7 of
 * 24)". The fourth quarter says what it did instead of counting toward it:
 * "(4 of 4, a whole heart, 8 of 24)". The label carries the news so every
 * candidate of the line keeps it, down to the bare label.
 */
const heartPieceLabel = (itemName: string, count: ReceiptCount): string => {
  const towardNext = ((count.ordinal - 1) % PIECES_PER_HEART) + 1;
  const quarter = towardNext === PIECES_PER_HEART
    ? `${PIECES_PER_HEART} of ${PIECES_PER_HEART}, a whole heart`
    : `${towardNext} of ${PIECES_PER_HEART} to a heart`;
  return `${itemName} (${quarter}, ${count.ordinal} of ${count.total})`;
};

const triforceLabel = (itemName: string, count: ReceiptCount): string =>
  (count.required === undefined
    ? `${itemName} ${ofTotal(count)}`
    : `${itemName} (${count.ordinal} of ${count.required}, ${count.total} available)`);

const numberedItemLabel = (itemName: string, count: ReceiptCount | undefined): string => {
  const dungeonItem = DUNGEON_ITEM_RE.exec(itemName);
  if (dungeonItem !== null) {
    const [, base, dungeon] = dungeonItem;
    return count === undefined ? `${base} of ${dungeon}` : `${base} of ${dungeon} ${ofTotal(count)}`;
  }
  if (count === undefined) return itemName;
  const countClass = countClassOf(itemName);
  if (countClass === 'heart-piece') return heartPieceLabel(itemName, count);
  if (countClass === 'triforce') return triforceLabel(itemName, count);
  if (countClass?.startsWith('progressive:')) {
    return `${itemName.slice(PROGRESSIVE_PREFIX.length)} tier ${count.ordinal} of ${count.total}`;
  }
  return `${itemName} ${ofTotal(count)}`;
};

export { numberedItemLabel };
