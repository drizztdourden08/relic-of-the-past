/* @layer shared-game @kind logic */
/**
 * The name a shop is listed under inside its own world's section.
 *
 * A world-titled heading already says which half of the overworld it covers, so a name
 * listed under one does not repeat those words. Taking them out is a presentation rule and
 * not a fact about the shop, which is why it is derived here instead of stored on a record.
 * The words are taken out anywhere in the name, because one shop wears its half inside a
 * parenthesis instead of in front, and the qualifier that tells two same-named shops apart
 * (the parenthesised area) survives untouched.
 *
 * One shop needs an exception. Stripping the world words off the dark-world potion shop and
 * the potion seller's hut leaves both reading "Potion Shop", so the hut is listed under a
 * name of its own.
 */
const WORLD_WORDS_PATTERN = /\b(?:Light World|Dark World|Light|Dark)\s+/g;

/** shopId -> the name it is listed under, for the one shop the rule above cannot tell apart. */
const SHOP_LIST_NAMES: Readonly<Record<string, string>> = {
  'potion-shop': "Potion Seller's Hut",
};

const shortShopNameOf = (shopId: string, shopName: string): string =>
  SHOP_LIST_NAMES[shopId] ?? shopName.replace(WORLD_WORDS_PATTERN, '').trim();

export { shortShopNameOf };
