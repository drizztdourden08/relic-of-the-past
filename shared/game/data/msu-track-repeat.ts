/* @layer shared-game-data @kind data */
/**
 * Which music slots loop and which play once — transcribed from the game's own table.
 *
 * Most music repeats, but fanfares and stings (item found, dungeon cleared, a death) are
 * meant to play through and stop. A classic MSU-1 pack carries no per-track metadata, so
 * this table is the only thing that says which is which; getting it wrong makes a two-second
 * jingle repeat forever.
 */

/** Indexed by music slot; 1 = loops, 0 = plays once. */
const TRACK_REPEATS: readonly number[] = [
  1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0,
  1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1,
  1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
];

/** Tracks past the transcribed range (the Deluxe extension) are treated as looping. */
const trackRepeats = (trackNum: number): boolean =>
  trackNum >= TRACK_REPEATS.length ? true : TRACK_REPEATS[trackNum] === 1;

export { trackRepeats };
