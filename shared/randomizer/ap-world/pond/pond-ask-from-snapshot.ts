/* @layer shared-game @kind logic */
/**
 * Snapshot values → one pond's ask, and back.
 *
 * The rupee row is not read from rows of its own: its two ends ARE the
 * setting's ladder ends, handed in by the caller, so the range a player cuts
 * on the panel is the range she asks over. Only its tick is a row.
 *
 * An ask asking for rupees and nothing else is handed back as NOTHING
 * (pond-ask.data.ts): a setting with no ask means exactly that reading, so a
 * profile written before these rows existed, a placement frozen then, and a
 * player who left the block alone all carry the same setting.
 */
import {
  POND_ASK_BOTTLE_CONTENTS, POND_ASK_ROW_BY_KIND, asksOnlyRupees, pondRupeesOnlyAsk,
} from './pond-ask.data';
import {
  pondAskBottleContentKeyOf, pondAskBottleKeyOf, pondAskItemKeyOf, pondAskKeyOf,
  pondAskMaxKeyOf, pondAskMinKeyOf,
} from './pond-ask-keys';
import type { ApOptionValue } from '../options.type';
import type { PondAskAmountKind, PondAskCurrency, PondAskSetting } from './pond-ask.type';
import type { PondInstance } from './pond-instance.type';
import type { PondSetting } from './pond-profile.type';
import type { ShopCurrencySetting } from '../shops/shop-price.type';

type Values = Readonly<Record<string, ApOptionValue | undefined>>;

/** The two ends of one row: the pond's own ladder for rupees, its own stops for the rest. */
interface AskRange {
  min: number;
  max: number;
}

type RupeeEnds = AskRange;

const numberAt = (values: Values, key: string, fallback: number): number => {
  const value = values[key];
  const asked = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(asked) ? Math.floor(asked) : fallback;
};

/** The two ends of one counted row, ordered and held inside the stops it reads. */
const rangeOf = (values: Values, pond: PondInstance, kind: PondAskAmountKind): AskRange => {
  const { stops, defaultMin, defaultMax } = POND_ASK_ROW_BY_KIND[kind];
  const floor = stops[0];
  const ceiling = stops[stops.length - 1];
  const low = numberAt(values, pondAskMinKeyOf(pond, kind), defaultMin);
  const high = numberAt(values, pondAskMaxKeyOf(pond, kind), defaultMax);
  const held = (amount: number): number => Math.min(ceiling, Math.max(floor, amount));
  return { min: held(Math.min(low, high)), max: held(Math.max(low, high)) };
};

/** One counted row: its tick, and the range it reads the curve into. */
const countedRowOf = (values: Values, pond: PondInstance, currency: PondAskCurrency): ShopCurrencySetting => ({
  enabled: values[pondAskKeyOf(pond, currency)] === true,
  ...rangeOf(values, pond, currency),
});

/**
 * The ask these rows describe, always concrete: every row read, nothing
 * omitted. An absent rupee tick reads as TICKED, because a snapshot with no
 * ask block at all is a pond that charged rupees and nothing else.
 */
const readPondAsk = (values: Values, pond: PondInstance, ladder: RupeeEnds): PondAskSetting => ({
  rupees: { enabled: values[pondAskKeyOf(pond, 'rupees')] !== false, min: ladder.min, max: ladder.max },
  bombs: countedRowOf(values, pond, 'bombs'),
  arrows: countedRowOf(values, pond, 'arrows'),
  bottle: {
    enabled: values[pondAskBottleKeyOf(pond)] === true,
    ...rangeOf(values, pond, 'bottle'),
    contents: POND_ASK_BOTTLE_CONTENTS
      .filter(({ content }) => values[pondAskBottleContentKeyOf(pond, content)] !== false)
      .map(({ content }) => content),
  },
  item: { enabled: values[pondAskItemKeyOf(pond)] === true },
});

/**
 * The ask a setting carries, or nothing when it is the one an absent ask
 * already means. Stored settings stay as small, and as comparable, as they
 * were before the block existed.
 */
const parsePondAsk = (
  values: Values, pond: PondInstance, ladder: RupeeEnds,
): PondAskSetting | undefined => {
  const ask = readPondAsk(values, pond, ladder);
  return asksOnlyRupees(ask) ? undefined : ask;
};

/**
 * What one setting asks for: its own ask, or the rupees-only reading an absent
 * one means. The rupee row's two ends are taken from the ladder every time, so
 * a stored ask can never drift away from the prices it is supposed to name.
 */
const askOfSetting = (setting: PondSetting): PondAskSetting => {
  if (setting.mode === 'capacity') return pondRupeesOnlyAsk(0, 0);
  const custom = setting.mode === 'custom' ? setting : undefined;
  const ladder = { min: custom?.start ?? 0, max: custom?.max ?? 0 };
  if (setting.ask === undefined) return pondRupeesOnlyAsk(ladder.min, ladder.max);
  return { ...setting.ask, rupees: { ...setting.ask.rupees, ...ladder } };
};

/** The rows one ask writes: the inverse of parsePondAsk, minus the rupee ends the ladder owns. */
const pondAskValuesOf = (setting: PondSetting, pond: PondInstance): Record<string, ApOptionValue> => {
  const ask = askOfSetting(setting);
  const counted = (['bombs', 'arrows'] as const).flatMap((currency) => [
    [pondAskKeyOf(pond, currency), ask[currency].enabled] as const,
    // Written as the choice rows spell them, the way the price range always has.
    [pondAskMinKeyOf(pond, currency), String(ask[currency].min)] as const,
    [pondAskMaxKeyOf(pond, currency), String(ask[currency].max)] as const,
  ]);
  return {
    ...Object.fromEntries(counted),
    [pondAskKeyOf(pond, 'rupees')]: ask.rupees.enabled,
    [pondAskBottleKeyOf(pond)]: ask.bottle.enabled,
    [pondAskMinKeyOf(pond, 'bottle')]: String(ask.bottle.min),
    [pondAskMaxKeyOf(pond, 'bottle')]: String(ask.bottle.max),
    ...Object.fromEntries(POND_ASK_BOTTLE_CONTENTS.map(({ content }) =>
      [pondAskBottleContentKeyOf(pond, content), ask.bottle.contents.includes(content)])),
    [pondAskItemKeyOf(pond)]: ask.item.enabled,
  };
};

export { askOfSetting, parsePondAsk, pondAskValuesOf, readPondAsk };
export type { AskRange, RupeeEnds };
