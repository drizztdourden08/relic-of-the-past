/* @layer shared-game @kind logic */
/**
 * The lowest FINAL cap the wallet may stop at: the largest rupee count a seed
 * built from these settings can be asked to hold at once, rounded up onto the
 * wallet ladder.
 *
 * Same shape as the projectiles floor next door (max-floor.ts) and there for
 * the same reason. A cap below what the seed will charge leaves a check nobody
 * can pay for, and under full accessibility the generator then refuses every
 * seed instead of handing over a hard one. The editor snaps the max thumb
 * onto this rung and the snapshot reader raises a stored cap onto it with a
 * note, so a profile written before the floor existed rolls instead of failing.
 *
 * What can set it:
 *   - the fixed prices (rules/tables/prices.data.ts): a check or a passage
 *     charges what the unmodified game charges and no option moves it;
 *   - a bottle content offered as a shelf price whose only repeatable source
 *     is a counter that sells it, since paying again means buying it again
 *     (rules/shop-prices.ts, potion-price/potion-cauldrons.data.ts);
 *   - the paid-shot option, which asks for the first purchase and then the
 *     ending's shots back to back (retro/retro-bow.data.ts).
 *
 * What cannot, and why:
 *   - a rolled shelf price: both ends of its range are already brought down to
 *     the cap the profile reaches (shops/shop-price-plan.ts), so a roll can
 *     never ask for more than the wallet holds;
 *   - the pond, held to the wallet the same way (pond/pond-wallet-top.ts)
 *     instead of the wallet being held to it.
 *
 * The paid-shot costs are read as STORED, not as the reader hands them back.
 * They are held down to the wallet on read (retro/retro-cost-ceiling.ts), so
 * taken from there they could never raise anything; read as asked for, the cap
 * grows to meet the costs instead of the costs shrinking to meet the cap,
 * which is the way round a player setting them expects.
 *
 * A content whose counter went to the shuffle is counted here too. It can only
 * make the number smaller, never larger, so counting it errs on the side where
 * every price stays payable.
 */
import { POTION_CAULDRONS } from '../potion-price/potion-cauldrons.data';
import { PRICED_ENTRIES } from '../rules/tables/prices.data';
import { retroWalletNeed } from '../retro/retro-bow.data';
import { storedRetroBowOf } from '../retro/retro-from-snapshot';
import { BOTTLE_KEY, bottleContentKeyOf } from '../shops/shop-price-options.data';
import { WALLET } from './capacity-family';
import type { CapacityProfile } from './capacity-profile.type';
import type { ApOptionValue } from '../options.type';

type Values = Readonly<Record<string, ApOptionValue | undefined>>;

/** One thing the seed can charge for, and what it is called where a player would look. */
interface WalletDemand {
  need: number;
  label: string;
}

interface WalletFloor {
  /** Rupees the dearest demand asks for at once. */
  need: number;
  /** What asks for them, in its own name. */
  label: string;
  /** Ladder index of the lowest final cap that holds the demand. */
  rung: number;
  /** The cap that rung stands for. */
  top: number;
  /** One line naming what set the floor; empty while nothing does. */
  reason: string;
}

const dearestOf = (demands: readonly WalletDemand[]): WalletDemand =>
  demands.reduce((dearest, demand) => (demand.need > dearest.need ? demand : dearest));

/** The priciest row of the fixed table: the one demand no settings can take away. */
const fixedDemand = (): WalletDemand => {
  const entry = PRICED_ENTRIES.reduce((dearest, row) => (row.price > dearest.price ? row : dearest));
  return { need: entry.price, label: entry.name };
};

const bottleDemand = (values: Values): WalletDemand | undefined => {
  if (values[BOTTLE_KEY] !== true) return undefined;
  const offered = POTION_CAULDRONS.filter((row) => values[bottleContentKeyOf(row.content)] !== false);
  if (offered.length === 0) return undefined;
  const dearest = offered.reduce((row, next) => (next.price > row.price ? next : row));
  return { need: dearest.price, label: `${dearest.label} over the counter` };
};

const retroDemand = (values: Values): WalletDemand | undefined => {
  // A read, never a write: the stored rows carry no capacity of their own.
  const setting = storedRetroBowOf(values as Readonly<Record<string, ApOptionValue>>);
  return setting.enabled ? { need: retroWalletNeed(setting), label: 'the paid shots' } : undefined;
};

const rungHolding = (need: number): number => {
  const rung = WALLET.ladder.findIndex((value) => value >= need);
  return rung === -1 ? WALLET.ladder.length - 1 : rung;
};

/** The floor these settings put under the wallet's final cap. */
const walletFloorOf = (values: Values): WalletFloor => {
  const demands = [fixedDemand(), bottleDemand(values), retroDemand(values)]
    .filter((demand): demand is WalletDemand => demand !== undefined);
  const { need, label } = dearestOf(demands);
  const rung = rungHolding(need);
  return { need, label, rung, top: WALLET.ladder[rung], reason: `${label} can ask for ${need} at once` };
};

const NO_WALLET_FLOOR: WalletFloor = { need: 0, label: '', rung: 0, top: 0, reason: '' };

/**
 * The profile as the seed reads it under this floor: a Custom final cap below
 * the floor raised onto it, everything else untouched. A family left alone
 * keeps the vanilla cap, which stands above every fixed price.
 */
const holdWalletToFloor = (profile: CapacityProfile, floor: WalletFloor): CapacityProfile => {
  const { wallet } = profile;
  if (wallet.mode !== 'custom' || wallet.max >= floor.top) return profile;
  return { ...profile, wallet: { ...wallet, max: floor.top } };
};

export { NO_WALLET_FLOOR, holdWalletToFloor, walletFloorOf };
export type { WalletDemand, WalletFloor };
