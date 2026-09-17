/* @layer shared-game @kind logic */
/**
 * The snapshot keys of one pond's ask block. Every key carries the pond it
 * belongs to (`pond_wishing_ask_bombs_max`), the way the pond's other rows do,
 * so the three ponds are set apart in the same snapshot.
 *
 * The rupee row's two ends are the pond's ladder ends: `pond_<id>_start` and
 * `pond_<id>_max` used to spell them and now read onto this row
 * (pond-key-migration.data.ts), so one key pair says what the ladder costs and
 * what she asks for, and the two can never drift apart.
 *
 * The bottle carries a count, so it carries the same two range keys every
 * other counted row does, under its own name.
 */
import { POND_ASK_BOTTLE_CONTENTS, POND_ASK_ROWS } from './pond-ask.data';
import type { PondAskAmountKind, PondAskCurrency } from './pond-ask.type';
import type { PondInstance } from './pond-instance.type';
import type { ShopBottleContent } from '../shops/shop-price.type';

const askKeyOf = (pond: PondInstance, row: string): string => `pond_${pond.id}_ask_${row}`;

/** One counted row: its opt-in, and the two ends of the range it ramps over. */
const pondAskKeyOf = (pond: PondInstance, currency: PondAskCurrency): string => askKeyOf(pond, currency);
const pondAskMinKeyOf = (pond: PondInstance, kind: PondAskAmountKind): string =>
  `${askKeyOf(pond, kind)}_min`;
const pondAskMaxKeyOf = (pond: PondInstance, kind: PondAskAmountKind): string =>
  `${askKeyOf(pond, kind)}_max`;

const pondAskBottleKeyOf = (pond: PondInstance): string => askKeyOf(pond, 'bottle');
const pondAskBottleContentKeyOf = (pond: PondInstance, content: ShopBottleContent): string =>
  `${askKeyOf(pond, 'bottle')}_${content.replace(/-/g, '_')}`;

const pondAskItemKeyOf = (pond: PondInstance): string => askKeyOf(pond, 'item');

/** Every ask key of one pond, in the order the block stacks its rows. */
const pondAskKeysOf = (pond: PondInstance): readonly string[] => [
  ...POND_ASK_ROWS.flatMap((row) => [
    pondAskKeyOf(pond, row.currency), pondAskMinKeyOf(pond, row.currency), pondAskMaxKeyOf(pond, row.currency),
  ]),
  pondAskBottleKeyOf(pond),
  pondAskMinKeyOf(pond, 'bottle'),
  pondAskMaxKeyOf(pond, 'bottle'),
  ...POND_ASK_BOTTLE_CONTENTS.map(({ content }) => pondAskBottleContentKeyOf(pond, content)),
  pondAskItemKeyOf(pond),
];

export {
  pondAskBottleContentKeyOf, pondAskBottleKeyOf, pondAskItemKeyOf, pondAskKeyOf, pondAskKeysOf,
  pondAskMaxKeyOf, pondAskMinKeyOf,
};
