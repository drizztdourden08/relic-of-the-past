/* @layer shared-game @kind logic */
import { itemKeyOfName } from '../world/display-names/item-key-name';
import { primary } from './highlight-markup/primary';
import { countClassOf } from './receipt-counts';
import { DUNGEON_ITEM_RE, PIECES_PER_HEART, PROGRESSIVE_PREFIX } from './receipt-text.constants';
import type { ReceiptCount } from './receipt-counts';

const ofTotal = (count: ReceiptCount): string => `(${count.ordinal} of ${count.total})`;

const heartPieceLabel = (itemName: string, count: ReceiptCount): string => {
  const towardNext = ((count.ordinal - 1) % PIECES_PER_HEART) + 1;
  const quarter = towardNext === PIECES_PER_HEART
    ? `${PIECES_PER_HEART} of ${PIECES_PER_HEART}, a whole heart`
    : `${towardNext} of ${PIECES_PER_HEART} to a heart`;
  return `${primary(itemName)} (${quarter}, ${count.ordinal} of ${count.total})`;
};

const triforceLabel = (itemName: string, count: ReceiptCount): string =>
  (count.required === undefined
    ? `${primary(itemName)} ${ofTotal(count)}`
    : `${primary(itemName)} (${count.ordinal} of ${count.required}, ${count.total} available)`);

const numberedItemLabel = (itemName: string, count: ReceiptCount | undefined): string => {
  const dungeonItem = DUNGEON_ITEM_RE.exec(itemName);
  if (dungeonItem !== null) {
    const [, base, dungeon] = dungeonItem;
    const name = primary(`${base} of ${dungeon}`);
    return count === undefined ? name : `${name} ${ofTotal(count)}`;
  }
  if (count === undefined) return primary(itemName);
  const countClass = countClassOf(itemKeyOfName(itemName));
  if (countClass === 'heart-piece') return heartPieceLabel(itemName, count);
  if (countClass === 'triforce') return triforceLabel(itemName, count);
  if (countClass?.startsWith('progressive:')) {
    return `${primary(itemName.slice(PROGRESSIVE_PREFIX.length))} tier ${count.ordinal} of ${count.total}`;
  }
  return `${primary(itemName)} ${ofTotal(count)}`;
};

export { numberedItemLabel };
