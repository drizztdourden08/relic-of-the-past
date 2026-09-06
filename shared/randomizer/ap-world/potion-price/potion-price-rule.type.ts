/* @layer shared-game @kind types */
/**
 * The pair the shop scope and the bottle-price currencies form. A shelf may
 * be priced in a bottle content, and a content the player can no longer buy
 * makes that price unpayable — so neither side can be read on its own.
 */
import type { ApOptionValue } from '../options.type';
import type { ShopScope } from '../shops/shop-scope.type';
import type { ShopBottleContent } from '../shops/shop-price.type';

/** What the player asked for: which slots may be shuffled, and the price rows they set. */
interface PotionPriceSelection {
  shops: ShopScope;
  /** The price rows as the panel holds them — a patch over the catalog baselines. */
  prices: Readonly<Record<string, ApOptionValue>>;
}

interface ReconciledPotionPrice {
  /** The price rows the seed is really built from: a blocked content forced off. */
  prices: Readonly<Record<string, ApOptionValue>>;
  /** One plain sentence per content the scope took away; [] when nothing is blocked. */
  notes: readonly string[];
  /** Contents no cauldron sells any more — what the roll must refuse. */
  blockedContents: readonly ShopBottleContent[];
  /** Their catalog keys, so the panel can grey exactly those rows. */
  blockedKeys: ReadonlySet<string>;
}

export type { PotionPriceSelection, ReconciledPotionPrice };
