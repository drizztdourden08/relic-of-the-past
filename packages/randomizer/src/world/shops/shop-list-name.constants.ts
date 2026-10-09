/* @layer shared-game @kind constants */
const WORLD_WORDS_PATTERN = /\b(?:Light World|Dark World|Light|Dark)\s+/g;

const SHOP_LIST_NAMES: Readonly<Record<string, string>> = {
  'potion-shop': "Potion Seller's Hut",
};

export { SHOP_LIST_NAMES, WORLD_WORDS_PATTERN };
