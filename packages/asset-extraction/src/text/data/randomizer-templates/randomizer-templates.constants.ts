/* @layer shared-asset-extraction @kind verbatim @source the randomizer's own receipt and shop messages, written in the game's dialogue format */
const RANDOMIZER_MSG_BASE = 397;

const RANDOMIZER_DIALOGUE_TEMPLATES: readonly string[] = [
  'A shuffled treasure!',
  'Your equipment improves!',
  'A tool of this palace!',
  'A delivery arrives!',
  'A gift from another land!',
  'You have no bow and[2]arrows to play with!',
  'Sorry, but you do not seem[2]to have enough arrows.',
  'Sorry, but you do not seem[2]to have enough bombs.',
  'Sorry, but you do not seem[2]to have enough hearts.',
  'Sorry, but you do not seem[2]to have a red potion.',
  'Sorry, but you do not seem[2]to have a green potion.',
  'Sorry, but you do not seem[2]to have a blue potion.',
  'Sorry, but you do not seem[2]to have a bottled fairy.',
  'Sorry, but you do not seem[2]to have a bottled bee.',
  'Thank you very much.[2]Please come again.',
];

const RANDOMIZER_RECEIPT_MSG = {
  generic: RANDOMIZER_MSG_BASE + 0,
  progressive: RANDOMIZER_MSG_BASE + 1,
  dungeonItem: RANDOMIZER_MSG_BASE + 2,
  delivered: RANDOMIZER_MSG_BASE + 3,
  online: RANDOMIZER_MSG_BASE + 4,
} as const;

const RANDOMIZER_SEAM_MSG = {
  noBowToPlay: RANDOMIZER_MSG_BASE + 5,
  shopNeedsArrows: RANDOMIZER_MSG_BASE + 6,
  shopNeedsBombs: RANDOMIZER_MSG_BASE + 7,
  shopNeedsHearts: RANDOMIZER_MSG_BASE + 8,
  shopNeedsRedPotion: RANDOMIZER_MSG_BASE + 9,
  shopNeedsGreenPotion: RANDOMIZER_MSG_BASE + 10,
  shopNeedsBluePotion: RANDOMIZER_MSG_BASE + 11,
  shopNeedsFairy: RANDOMIZER_MSG_BASE + 12,
  shopNeedsBee: RANDOMIZER_MSG_BASE + 13,
  shopPurchase: RANDOMIZER_MSG_BASE + 14,
} as const;

const TEMPLATE_TRANSLATIONS: Readonly<Record<string, readonly string[]>> = {};

export {
  RANDOMIZER_DIALOGUE_TEMPLATES, RANDOMIZER_MSG_BASE, RANDOMIZER_RECEIPT_MSG, RANDOMIZER_SEAM_MSG, TEMPLATE_TRANSLATIONS,
};
