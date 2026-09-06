/* @layer shared-game @kind logic */
/**
 * Setting + seed → the pond's throws, prizes and locations. One derivation
 * for the generator, the logic rules, the core arming and the panel, so they
 * can never disagree.
 *
 *   capacity     — nothing: the pond keeps its native purchase loop and its
 *                  two slots answer to the capacity families alone.
 *   vanilla-cost — fourteen throws of a hundred (the native economy: seven
 *                  upgrades per counted family at a hundred each). The first
 *                  `items` throws hand over a pool item, the rest climb the
 *                  family the player picked, exactly as vanilla does.
 *   custom       — the capacity curve machinery over the PRICE ladder: the
 *                  span between the start and the final price, cut into one
 *                  jump per further throw, so the cumulative ladder IS the
 *                  price list. The first `items` throws hand over a pool item.
 *   gamble       — twelve chances at a rising price; `items` of them win,
 *                  drawn ONCE from the seed and then fixed. A losing throw
 *                  hands back half its price and nothing else.
 *
 * A fixed schedule is held at the setting's ceiling when it carries one: the
 * wallet's reach, folded in on read (pond-wallet-top.ts), so no throw ever
 * asks for more than the wallet can hold.
 *
 * The gamble draw is the only seeded step, and it is a plain sorted sample of
 * distinct indices, so a spoiler states the truth and the logic reads the
 * schedule rather than a probability: prize k sits at a known throw, every
 * earlier throw must be paid to reach it, and the wallet reading below is
 * that guaranteed worst case.
 */
import { createRng } from '../../rng';
import { jumpsOf } from '../capacity/curves/jumps-of';
import { ladderOf } from '../capacity/curves/ladder-of';
import {
  POND_GAMBLE_CHANCES, POND_PRICE_LADDER, POND_VANILLA_PRICE, POND_VANILLA_THROWS,
  gamblePriceOf, gambleRefundOf,
} from './pond-ladder.data';
import { POND_PRIZE_LOCATIONS } from './pond-locations.data';
import type { PondPlan, PondSetting, PondThrow } from './pond-profile.type';

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

/** The Custom price list: start, then one entry per curve jump up to the final price. */
const customPricesOf = (setting: Extract<PondSetting, { mode: 'custom' }>): number[] => {
  const low = rungOf(setting.start);
  const span = Math.max(0, rungOf(setting.max) - low);
  const wanted = Math.max(1, Math.min(setting.throws, POND_PRICE_LADDER.length));
  if (span === 0 || wanted === 1) return Array<number>(wanted).fill(POND_PRICE_LADDER[low]);
  return ladderOf(POND_PRICE_LADDER, low, jumpsOf(setting.shape, wanted - 1, span));
};

/** The winning throw indices of a gamble, drawn once from the seed and sorted. */
const gambleWinnersOf = (items: number, seed: string): number[] => {
  const wanted = Math.max(0, Math.min(items, POND_GAMBLE_CHANCES));
  if (wanted === 0) return [];
  const indices = createRng(`${seed}#pond-gamble`)
    .shuffle(Array.from({ length: POND_GAMBLE_CHANCES }, (_, index) => index));
  return indices.slice(0, wanted).sort((a, b) => a - b);
};

/** Prices + prize schedule → the throws, with the refund a losing gamble throw pays. */
const throwsOf = (prices: readonly number[], prizeAt: ReadonlyMap<number, number>, gamble: boolean): PondThrow[] =>
  prices.map((price, index) => ({
    price,
    prize: prizeAt.get(index) ?? -1,
    refund: gamble && !prizeAt.has(index) ? gambleRefundOf(price) : 0,
  }));

/** The first `count` throws win, in order — the schedule of every non-gamble mode. */
const leadingPrizes = (count: number, throwCount: number): Map<number, number> => {
  const prizeAt = new Map<number, number>();
  for (let index = 0; index < Math.min(count, throwCount); index += 1) prizeAt.set(index, index);
  return prizeAt;
};

type ActiveSetting = Exclude<PondSetting, { mode: 'capacity' }>;

const scheduleOf = (setting: ActiveSetting, seed: string): { prices: number[]; prizeAt: Map<number, number> } => {
  if (setting.mode === 'gamble') {
    const prices = Array.from({ length: POND_GAMBLE_CHANCES }, (_, index) => gamblePriceOf(index));
    const prizeAt = new Map(gambleWinnersOf(setting.items, seed).map((at, ordinal) => [at, ordinal]));
    return { prices, prizeAt };
  }
  if (setting.mode === 'vanilla-cost') {
    const prices = Array<number>(POND_VANILLA_THROWS).fill(POND_VANILLA_PRICE);
    return { prices, prizeAt: leadingPrizes(setting.items, prices.length) };
  }
  const prices = customPricesOf(setting);
  return { prices, prizeAt: leadingPrizes(setting.items, prices.length) };
};

/**
 * The plan of a setting under one seed. `seed` only matters to Gamble; every
 * other mode is a pure function of the setting.
 */
const pondPlanOf = (setting: PondSetting, seed = ''): PondPlan => {
  if (setting.mode === 'capacity') return EMPTY_PLAN;
  const { prices, prizeAt } = scheduleOf(setting, seed);
  const throws = throwsOf(prices, prizeAt, setting.mode === 'gamble');
  const worstPriceOfPrize: number[] = [];
  let worst = 0;
  for (const entry of throws) {
    worst = Math.max(worst, entry.price);
    if (entry.prize >= 0) worstPriceOfPrize[entry.prize] = worst;
  }
  return {
    mode: setting.mode,
    throws,
    locations: POND_PRIZE_LOCATIONS.slice(0, worstPriceOfPrize.length),
    worstPriceOfPrize,
    totalPrice: prices.reduce((sum, price) => sum + price, 0),
  };
};

export { customPricesOf, gambleWinnersOf, pondPlanOf, rungOf };
