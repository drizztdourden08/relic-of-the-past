/* @layer shared-game @kind logic */
/**
 * The rule taking a counted currency off the price list when the seed has
 * nothing of it to pay with, and the only place it is written down.
 *
 * Retro bow takes arrows out of the world: no arrow pickup is in the pool,
 * every prize that used to be arrows is rupees, and the bow itself is fed
 * rupees per shot. A shelf priced in arrows under retro would send the
 * player farming enemy drops for a currency the seed has otherwise erased,
 * so:
 *
 *   retro bow on   ⇒ arrows cannot be a price
 *   retro bow off  ⇒ the arrows row is the player's own again
 *
 * The follow is a MASK rather than an overwrite, the way the potion rule
 * (potion-price/) treats a cauldron handed to the shuffle: the player's own
 * tick stays in the choices and comes back the moment retro is switched
 * off. The panel greys the row and says why on it; the plan refuses the
 * currency from the snapshot alone, so a snapshot this app did not write
 * cannot roll an arrow price under retro either.
 */
import { retroBowOfValues } from '../retro/retro-from-snapshot';
import { currencyKeyOf } from './shop-price-options.data';
import type { ApOptionValue } from '../options.type';
import type { ShopCountedCurrency } from './shop-price.type';

type Values = Readonly<Record<string, ApOptionValue>>;

/** One line under the arrows row while retro holds it off. */
const RETRO_ARROWS_NOTE = 'Off while retro bow is on: there are no arrows to pay with';

/** The currencies this snapshot has nothing of — what the roll must refuse. */
const blockedCurrenciesOfValues = (values: Values): readonly ShopCountedCurrency[] =>
  (retroBowOfValues(values).enabled ? ['arrows'] : []);

/** Their catalog keys, so the panel can grey exactly those rows. */
const blockedCurrencyKeysOfValues = (values: Values): ReadonlySet<string> =>
  new Set(blockedCurrenciesOfValues(values).map(currencyKeyOf));

/** Why a blocked currency's row is greyed; empty for a currency nothing blocks. */
const blockedCurrencyNote = (currency: ShopCountedCurrency): string =>
  (currency === 'arrows' ? RETRO_ARROWS_NOTE : '');

export { blockedCurrenciesOfValues, blockedCurrencyKeysOfValues, blockedCurrencyNote };
