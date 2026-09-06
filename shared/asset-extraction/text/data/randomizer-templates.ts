/* @layer shared-asset-extraction @kind data */
/**
 * Randomizer template lines, appended after the 397 canonical vanilla dialogue lines at
 * BAKE time (build-language-entry.ts), never persisted into a pack's dialogue.txt, so
 * every language entry gains them on its next compile regardless of when the pack was
 * extracted. The first five are the receipt classes; the rest belong to whichever seam
 * names them.
 *
 * The order is a frozen contract with the C side: kReceiptMsg_* / kRandomizerMsg_* in
 * core/game-hooks/game_hooks.h index these lines as dialogue message ids
 * 397 + position. Append new templates at the end only, and bump CURRENT_BAKE_VERSION
 * (bake-version.ts) so cached blobs are recompiled instead of stopping short of the new id.
 *
 * The game's text engine has no runtime string substitution (only the player-name and
 * preloaded-digit commands), so these are fixed context-class lines, not per-item text.
 * Character set is restricted to letters, digits, space and .,!?, the intersection of
 * every language's alphabet (language-data.ts), so the same fallback text encodes
 * under every encoder when a language has no translation of its own. [1]/[2]/[3]
 * select the box's three lines and are commands both encoders share, so a line long
 * enough to wrap says where it breaks instead of trusting the box to do it.
 */

/** First appended line's dialogue message id (= the canonical vanilla line count). */
const RANDOMIZER_MSG_BASE = 397;

/** English fallback templates, in kReceiptMsg_* order. */
const RANDOMIZER_DIALOGUE_TEMPLATES: readonly string[] = [
  'A shuffled treasure!',      // generic: an overridden chest with no richer class
  'Your equipment improves!',  // progressive: one tier of a multi-tier family
  'A tool of this palace!',    // dungeon item: key, big key, palace-bitmask trio
  'A delivery arrives!',       // delivered: granted by the delivery queue
  'A gift from another land!', // online: sent by another player in a shared game
  // The archery host, refusing a fee for a game that could not be played (archery_host.c).
  'You have no bow and[2]arrows to play with!',
  // A shelf refusing a price the player cannot pay, one line per non-rupee currency
  // (shop_refusal.c). The five bottled ones follow the bottle-slot values the game
  // stores, 3 to 7, so the core indexes them by the value a bottle price demands.
  'Sorry, but you do not seem[2]to have enough arrows.',
  'Sorry, but you do not seem[2]to have enough bombs.',
  'Sorry, but you do not seem[2]to have enough hearts.',
  'Sorry, but you do not seem[2]to have a red potion.',
  'Sorry, but you do not seem[2]to have a green potion.',
  'Sorry, but you do not seem[2]to have a blue potion.',
  'Sorry, but you do not seem[2]to have a bottled fairy.',
  'Sorry, but you do not seem[2]to have a bottled bee.',
  // A shelf's thanks over the hold-up of what was bought (shop_overrides.c). The item is
  // in the player's hands, so the line names nothing.
  'Thank you very much.[2]Please come again.',
];

/** Message ids for the TS side (mirrors kReceiptMsg_* in game_hooks.h). */
const RANDOMIZER_RECEIPT_MSG = {
  generic: RANDOMIZER_MSG_BASE + 0,
  progressive: RANDOMIZER_MSG_BASE + 1,
  dungeonItem: RANDOMIZER_MSG_BASE + 2,
  delivered: RANDOMIZER_MSG_BASE + 3,
  online: RANDOMIZER_MSG_BASE + 4,
} as const;

/** Ids of the template lines a seam other than the receipt flow shows (kRandomizerMsg_*). */
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

/**
 * Per-language translations, keyed by language code, each in the same order and
 * length as the fallback list. None exist yet; a translated language adds its
 * entry here and the bake picks it up.
 */
const TEMPLATE_TRANSLATIONS: Readonly<Record<string, readonly string[]>> = {};

/** The template lines to append for |code|: its translation, or the fallback. */
const randomizerTemplateTexts = (code: string): readonly string[] => {
  const translated = TEMPLATE_TRANSLATIONS[code];
  if (translated && translated.length === RANDOMIZER_DIALOGUE_TEMPLATES.length) return translated;
  return RANDOMIZER_DIALOGUE_TEMPLATES;
};

export { RANDOMIZER_MSG_BASE, RANDOMIZER_DIALOGUE_TEMPLATES, RANDOMIZER_RECEIPT_MSG, RANDOMIZER_SEAM_MSG, randomizerTemplateTexts };
