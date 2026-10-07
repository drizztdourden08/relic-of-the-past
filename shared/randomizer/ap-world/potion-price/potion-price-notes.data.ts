/* @layer shared-game @kind data */
/**
 * The one sentence the potion/price rule shows the player, so the price block
 * and the run view say the same thing about the same state.
 */

/** Beside a content tick the shuffle has taken away. */
const blockedContentNote = (label: string): string =>
  `${label} is not for sale: its cauldron holds a shuffled item.`;

export { blockedContentNote };
