/* @layer shared-game @kind data */
/**
 * The rows a pond's ask block offers, and the ladders each of them ramps over.
 *
 * Rupees walk the pond's own price ladder (pond-ladder.data.ts), because the
 * ladder IS the rupee demand: its two ends are the row's two thumbs. Bombs and
 * arrows have no such ladder, so they get their own stops, which run up to
 * the biggest bag and quiver a capacity profile can build (fifty and seventy,
 * capacity/capacity-ladders.data.ts). The settings cut those stops at what
 * this profile's bag and quiver reach (pond-ceilings.ts), and the roll holds
 * both ends to the same reach, so a profile that shrinks a bag shrinks the
 * demand with it. A fresh row still opens inside a native bag and quiver.
 *
 * The bottle row counts bottles. A file has four slots and no upgrade path to
 * a fifth, so its stops are one to four and a fresh row asks for one, which is
 * what a bottle demand meant before it could be counted.
 *
 * Every row but rupees is OFF for a fresh profile. A pond has always charged
 * rupees and nothing else, so an untouched profile asks for exactly what it
 * asked for before these rows existed.
 */
import { BOTTLE_CONTENTS } from '../shops/shop-price-options.data';
import { POND_PRICE_LADDER, POND_VANILLA_WALLET_TOP } from './pond-ladder.data';
import type { PondAskAmountKind, PondAskCurrency, PondAskSetting } from './pond-ask.type';
import type { ShopCurrencySetting } from '../shops/shop-price.type';

/** Bombs: every count up to a native bag, then the bag sizes up to the biggest. */
const POND_BOMB_STOPS: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 35, 40, 50];

/** Arrows: coarsening as they climb, up to the biggest quiver. */
const POND_ARROW_STOPS: readonly number[] = [1, 2, 3, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 70];

/** Bottles: the four slots a file has, and no fifth to upgrade into. */
const POND_BOTTLE_STOPS: readonly number[] = [1, 2, 3, 4];

interface PondAskRow {
  /** What this row sets: one counted currency, or how many bottles. */
  currency: PondAskAmountKind;
  label: string;
  /** The amounts both thumbs sit on, and the stops the curve reads into. */
  stops: readonly number[];
  /** Where the range opens for a newly ticked row. */
  defaultMin: number;
  defaultMax: number;
}

/** A row the panel stacks as a currency, above the bottle and its contents. */
type PondCurrencyRow = PondAskRow & { currency: PondAskCurrency };

const POND_ASK_ROWS: readonly PondCurrencyRow[] = [
  {
    currency: 'rupees',
    label: 'Rupees',
    stops: POND_PRICE_LADDER,
    defaultMin: POND_PRICE_LADDER[0],
    defaultMax: POND_VANILLA_WALLET_TOP,
  },
  { currency: 'bombs', label: 'Bombs', stops: POND_BOMB_STOPS, defaultMin: 1, defaultMax: 5 },
  { currency: 'arrows', label: 'Arrows', stops: POND_ARROW_STOPS, defaultMin: 1, defaultMax: 10 },
];

/** The bottle's own range: one bottle unless the player opens it. */
const POND_BOTTLE_ROW: PondAskRow = {
  currency: 'bottle', label: 'Bottles', stops: POND_BOTTLE_STOPS, defaultMin: 1, defaultMax: 1,
};

const POND_ASK_ROW_BY_CURRENCY: Readonly<Record<PondAskCurrency, PondCurrencyRow>> = Object.fromEntries(
  POND_ASK_ROWS.map((row) => [row.currency, row]),
) as Readonly<Record<PondAskCurrency, PondCurrencyRow>>;

/** Every row carrying a number, which is what the one ramp reads. */
const POND_ASK_ROW_BY_KIND: Readonly<Record<PondAskAmountKind, PondAskRow>> = {
  ...POND_ASK_ROW_BY_CURRENCY, bottle: POND_BOTTLE_ROW,
};

/** The contents a bottle demand may name: the shop's own list, so the two rooms agree. */
const POND_ASK_BOTTLE_CONTENTS = BOTTLE_CONTENTS;

/** One counted row at its own defaults, unticked. */
const offRow = (kind: PondAskAmountKind): ShopCurrencySetting => {
  const { defaultMin, defaultMax } = POND_ASK_ROW_BY_KIND[kind];
  return { enabled: false, min: defaultMin, max: defaultMax };
};

/** What she asks for while no ask row says otherwise: rupees, over the ladder already cut. */
const pondRupeesOnlyAsk = (min: number, max: number): PondAskSetting => ({
  rupees: { enabled: true, min, max },
  bombs: offRow('bombs'),
  arrows: offRow('arrows'),
  bottle: { ...offRow('bottle'), contents: POND_ASK_BOTTLE_CONTENTS.map(({ content }) => content) },
  item: { enabled: false },
});

/** True while this ask is the one an absent ask stands for: rupees alone. */
const asksOnlyRupees = (ask: PondAskSetting): boolean =>
  ask.rupees.enabled && !ask.bombs.enabled && !ask.arrows.enabled && !ask.bottle.enabled && !ask.item.enabled;

export {
  POND_ARROW_STOPS, POND_ASK_BOTTLE_CONTENTS, POND_ASK_ROWS, POND_ASK_ROW_BY_CURRENCY,
  POND_ASK_ROW_BY_KIND, POND_BOMB_STOPS, POND_BOTTLE_ROW, POND_BOTTLE_STOPS, asksOnlyRupees,
  pondRupeesOnlyAsk,
};
export type { PondAskRow, PondCurrencyRow };
