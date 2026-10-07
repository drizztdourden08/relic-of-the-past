/* @layer bridge-wasm @kind logic */
/**
 * The two lines a planned wish pond speaks for itself. A planned visit takes
 * no throw and asks nothing, so the native lines at those two beats (the
 * question after she rises, the refusal of a spent water) cannot stand:
 *
 *   the award:   she rises and says this, then the visit's one rung follows
 *                 on its own receipt;
 *   the closing: a water whose ladder is spent, every time she is spoken to.
 *
 * A rung that asks for something speaks its own award line instead
 * (pond-demand-messages.ts), since the player did throw something in.
 *
 * Neither names what she hands over; the receipts say that. Candidates run
 * fullest first, so the composer keeps the longer wording when the box has
 * room (receipt-line.type.ts). Both waters share the wording, so the pool
 * carries one of each, and only when at least one water is planned.
 */

import { pondProfilesOfStats } from '@shared/randomizer/ap-world/fill/placement-ponds';
import { WISH_POND_WATERS } from './wish-pond-rung-keys';
import type { ApPlacement } from '@shared/randomizer/ap-world/fill/ap-placement.type';
import type { ReceiptLine } from '@shared/randomizer/receipt-text/receipt-line.type';

const WISH_POND_AWARD_LINE: ReceiptLine = [
  'You have no need to throw anything in. The water has kept its gifts for you.',
  'The water has kept its gifts for you.',
];

const WISH_POND_CLOSED_LINE: ReceiptLine = [
  'The water has given you all it held. There is nothing more.',
  'The water has nothing more to give.',
];

/** True when either water runs on a plan, which is when the core needs the two lines. */
const anyWishPondPlanned = (placement: ApPlacement): boolean => {
  const profiles = pondProfilesOfStats(placement.stats);
  return WISH_POND_WATERS.some(({ instance }) => profiles[instance.id].mode !== 'capacity');
};

/** The award line then the closing line, or none when neither water is planned. */
const wishPondLinesOf = (placement: ApPlacement): readonly ReceiptLine[] =>
  (anyWishPondPlanned(placement) ? [WISH_POND_AWARD_LINE, WISH_POND_CLOSED_LINE] : []);

export { WISH_POND_AWARD_LINE, WISH_POND_CLOSED_LINE, wishPondLinesOf };
