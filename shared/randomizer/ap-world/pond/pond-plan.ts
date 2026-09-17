/* @layer shared-game @kind logic */
/**
 * Setting → one pond's throws, prizes and locations. One derivation for the
 * generator, the logic rules, the core arming and the panel, so they can
 * never disagree.
 *
 *   capacity:     nothing. The pond keeps its native purchase loop and its
 *                  two slots answer to their vanilla grants alone.
 *   vanilla-cost: the native economy of THIS pond. At the capacity pond that
 *                  is fourteen throws of a hundred (seven upgrades per
 *                  counted family at a hundred each), the first `items` of
 *                  which hand over a pool item and the rest climb the family
 *                  the player picked. A wish pond charges nothing and asks
 *                  for nothing thrown, so it is its own two grants and no
 *                  throws at all.
 *   custom:       the capacity curve machinery over the PRICE ladder: the
 *                  span between the start and the final price, cut into one
 *                  jump per further throw, so the cumulative ladder IS the
 *                  price list. The first `items` throws hand over a pool item.
 *
 * A fixed schedule is held at the setting's ceiling when it carries one: the
 * wallet's reach, folded in on read (pond-wallet-top.ts), so no throw ever
 * asks for more than the wallet can hold.
 *
 * Nothing here is rolled: a plan is a pure function of its setting and its
 * pond. Prize k sits at a known throw, every earlier throw must be paid to
 * reach it, and the wallet reading below is that guaranteed worst case, so a
 * spoiler states the truth and the logic reads the schedule.
 */
import { jumpsOf } from '../capacity/curves/jumps-of';
import { ladderOf } from '../capacity/curves/ladder-of';
import { CAPACITY_POND } from './pond-instances.data';
import { POND_PRICE_LADDER, POND_VANILLA_PRICE, POND_VANILLA_THROWS } from './pond-ladder.data';
import { POND_RUNGS_BY_ID } from './pond-locations.data';
import type { PondInstance } from './pond-instance.type';
import type { PondFixedSetting, PondPlan, PondSetting, PondThrow } from './pond-profile.type';

const EMPTY_PLAN: PondPlan = {
  mode: 'capacity', throws: [], locations: [], worstPriceOfPrize: [], totalPrice: 0,
};

/** The rung a price sits on; the nearest rung at or above it when it is off-ladder. */
const rungOf = (price: number): number => {
  const rung = POND_PRICE_LADDER.indexOf(price);
  if (rung !== -1) return rung;
  const above = POND_PRICE_LADDER.findIndex((value) => value >= price);
  return above === -1 ? POND_PRICE_LADDER.length - 1 : above;
};

/**
 * Stretch a price list over more throws than it has prices, each price held
 * for its share of them in order, so the first throw keeps the first price
 * and the last keeps the last.
 */
const stretchOver = (prices: readonly number[], wanted: number): number[] =>
  (prices.length >= wanted
    ? [...prices]
    : Array.from({ length: wanted }, (_, index) => prices[Math.floor((index * prices.length) / wanted)]));

/**
 * The Custom price list: start, then one entry per curve jump up to the final
 * price. A range with fewer rungs than the throws asked for repeats its prices,
 * so a narrow range never sells fewer throws than the setting says.
 */
const customPricesOf = (setting: Extract<PondSetting, { mode: 'custom' }>): number[] => {
  const low = rungOf(setting.start);
  const span = Math.max(0, rungOf(setting.max) - low);
  const wanted = Math.max(1, Math.min(setting.throws, POND_PRICE_LADDER.length));
  if (span === 0 || wanted === 1) return Array<number>(wanted).fill(POND_PRICE_LADDER[low]);
  return stretchOver(ladderOf(POND_PRICE_LADDER, low, jumpsOf(setting.shape, wanted - 1, span)), wanted);
};

/**
 * Prices + prize schedule → the throws. `refund` is 0 throughout: no shipped
 * mode pays a losing throw anything, and the core keeps the channel for one
 * that might (pond-profile.type.ts).
 */
const throwsOf = (prices: readonly number[], prizeAt: ReadonlyMap<number, number>): PondThrow[] =>
  prices.map((price, index) => ({ price, prize: prizeAt.get(index) ?? -1, refund: 0 }));

/** The first `count` throws win, in order: the schedule every mode follows. */
const leadingPrizes = (count: number, throwCount: number): Map<number, number> => {
  const prizeAt = new Map<number, number>();
  for (let index = 0; index < Math.min(count, throwCount); index += 1) prizeAt.set(index, index);
  return prizeAt;
};

type ActiveSetting = Exclude<PondSetting, { mode: 'capacity' }>;

/** Only the capacity pond sells upgrades, so only it has a native price to reproduce. */
const sellsUpgrades = (pond: PondInstance): boolean => pond.id === CAPACITY_POND.id;

/**
 * A wish pond at its native economy: its own two grants, free, with nothing
 * thrown. `items` still says how many of the two are shuffled, so zero leaves
 * the pond out of the seed exactly as it does everywhere else.
 */
const vanillaSlotPlan = (setting: PondFixedSetting, pond: PondInstance): PondPlan => {
  const count = Math.max(0, Math.min(setting.items, pond.slots.length));
  return {
    mode: 'vanilla-cost',
    throws: [],
    locations: pond.slots.slice(0, count).map((slot) => slot.location),
    worstPriceOfPrize: Array<number>(count).fill(0),
    totalPrice: 0,
  };
};

const scheduleOf = (setting: ActiveSetting): { prices: number[]; prizeAt: Map<number, number> } => {
  if (setting.mode === 'vanilla-cost') {
    const prices = Array<number>(POND_VANILLA_THROWS).fill(POND_VANILLA_PRICE);
    return { prices, prizeAt: leadingPrizes(setting.items, prices.length) };
  }
  const prices = customPricesOf(setting);
  return { prices, prizeAt: leadingPrizes(setting.items, prices.length) };
};

/** The plan of a setting at one pond: a pure function of both, with nothing rolled. */
const pondPlanOf = (setting: PondSetting, pond: PondInstance = CAPACITY_POND): PondPlan => {
  if (setting.mode === 'capacity') return EMPTY_PLAN;
  if (setting.mode === 'vanilla-cost' && !sellsUpgrades(pond)) return vanillaSlotPlan(setting, pond);
  const { prices, prizeAt } = scheduleOf(setting);
  const throws = throwsOf(prices, prizeAt);
  const worstPriceOfPrize: number[] = [];
  let worst = 0;
  for (const entry of throws) {
    worst = Math.max(worst, entry.price);
    if (entry.prize >= 0) worstPriceOfPrize[entry.prize] = worst;
  }
  return {
    mode: setting.mode,
    throws,
    locations: POND_RUNGS_BY_ID[pond.id].slice(0, worstPriceOfPrize.length),
    worstPriceOfPrize,
    totalPrice: prices.reduce((sum, price) => sum + price, 0),
  };
};

export { customPricesOf, pondPlanOf, rungOf };
