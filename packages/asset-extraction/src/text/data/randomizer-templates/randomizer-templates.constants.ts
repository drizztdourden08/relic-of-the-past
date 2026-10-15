/* @layer shared-asset-extraction @kind data */
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

const TEMPLATE_TRANSLATIONS: Readonly<Record<string, readonly string[]>> = {};

export {
  RANDOMIZER_DIALOGUE_TEMPLATES,
  RANDOMIZER_MSG_BASE,
  RANDOMIZER_RECEIPT_MSG,
  TEMPLATE_TRANSLATIONS,
};
