/* @layer shared-game @kind logic */
/**
 * The rule binding the hut's cauldrons to the bottle-content prices, and the
 * only place it is written down.
 *
 * The hut is the one repeatable source of potions: each cauldron sells one
 * content, over and over, for rupees. A shelf priced in a bottle content
 * CONSUMES that content when it is paid, and a restocked shelf asks again,
 * so a price is only ever payable while its content can be bought back. Tick
 * a cauldron for shuffling and it holds a shuffled item instead of its
 * potion, which takes that content out of the game for good.
 *
 *   cauldron ticked (and the shops shuffling at all) ⇒ its content cannot be a price
 *   cauldron unticked                                ⇒ its content is available again
 *
 * Unlike the capacity/pond pair this one is NOT symmetric, and it would be
 * dishonest to pretend otherwise: a price cannot make a potion purchasable,
 * so the scope is always the authority and the currency rows only ever
 * follow it. The follow is a MASK, not an overwrite, so the player's own
 * tick is kept in the choices and comes back the moment the cauldron is
 * unticked, which is the same trick the capacity master switch uses, and it
 * is what makes "unticking restores availability" true without storing a
 * second copy of the answer.
 *
 * The reading is the TICKED set, not the opened one. Which ticked slots a
 * counted mode actually opens can depend on the seed, and the seed is only
 * fixed when the profile is created; a rule that changed under the panel
 * would be worse than one that is conservative, so a ticked cauldron counts
 * as lost whether or not this seed happens to take it.
 */
import { normalizeEnabled } from '../shops/shop-scope';
import { bottleContentKeyOf } from '../shops/shop-price-options.data';
import { shopScopeOfValues } from '../shops/shop-scope-from-values';
import { POTION_CAULDRONS } from './potion-cauldrons.data';
import { blockedContentNote } from './potion-price-notes.data';
import type { ApOptionValue } from '../options.type';
import type { ShopBottleContent } from '../shops/shop-price.type';
import type { ShopScope } from '../shops/shop-scope.type';
import type { PotionPriceSelection, ReconciledPotionPrice } from './potion-price-rule.type';

type Values = Readonly<Record<string, ApOptionValue>>;

/** The cauldrons this scope may hand over to the shuffle: none while nothing is shuffled. */
const lostCauldronsOf = (shops: ShopScope) => {
  if (shops.mode === 'vanilla') return [];
  const ticked = new Set(normalizeEnabled(shops.enabled));
  return POTION_CAULDRONS.filter((row) => ticked.has(row.canonicalIndex));
};

/** Contents no longer purchasable under this scope. */
const blockedContentsOf = (shops: ShopScope): readonly ShopBottleContent[] =>
  lostCauldronsOf(shops).map((row) => row.content);

/** The same answer read straight off a snapshot: what the generator refuses. */
const blockedContentsOfValues = (values: Values): readonly ShopBottleContent[] =>
  blockedContentsOf(shopScopeOfValues(values));

/** The rows the rule forces off; spread over the player's own price rows. */
const potionPriceOverrides = (shops: ShopScope): Readonly<Record<string, ApOptionValue>> =>
  Object.fromEntries(blockedContentsOf(shops).map((content) => [bottleContentKeyOf(content), false]));

/**
 * The price rows the seed is really built from, plus the sentences saying
 * what the scope took away. Idempotent: the mask forces the same rows off
 * however often it is applied.
 */
const reconcilePotionPrices = (selection: PotionPriceSelection): ReconciledPotionPrice => {
  const { shops, prices } = selection;
  const lost = lostCauldronsOf(shops);
  const blockedKeys = new Set(lost.map((row) => bottleContentKeyOf(row.content)));
  const notes = lost.map((row) => blockedContentNote(row.label));
  return {
    prices: { ...prices, ...potionPriceOverrides(shops) },
    notes,
    blockedContents: lost.map((row) => row.content),
    blockedKeys,
  };
};

/** The panel's reading: which rows to grey, and what to say under them. */
const potionPriceStateOfValues = (values: Values): ReconciledPotionPrice =>
  reconcilePotionPrices({ shops: shopScopeOfValues(values), prices: {} });

export {
  blockedContentsOf, blockedContentsOfValues, potionPriceOverrides, potionPriceStateOfValues,
  reconcilePotionPrices,
};
