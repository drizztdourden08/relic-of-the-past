/* @layer shared-store @kind types */
/**
 * Ratings and installs. A player rates an item at most once, only after installing it, and
 * never their own. Both records are keyed `<itemId>_<userId>`.
 */

type Stars = 1 | 2 | 3 | 4 | 5;

type Rating = { itemId: string; userId: string; stars: Stars; at: number };

/** Recorded by the download route; a rating needs one. */
type Install = {
  itemId: string;
  userId: string;
  /** The `n` of the version last downloaded. */
  version: number;
  firstAt: number;
  lastAt: number;
};

export type { Stars, Rating, Install };
