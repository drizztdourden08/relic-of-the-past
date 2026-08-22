/* @layer shared-game-data @kind data */
/**
 * Deluxe track remapping — transcribed from the game's own tables.
 *
 * The vanilla game has 36 music slots. "Deluxe" packs extend that: a slot that vanilla
 * reuses across many places is redirected to a per-area or per-entrance track (slots 37+),
 * so each region and interior can have its own music. Which replacement applies depends on
 * where the player is, which is why the remap needs the area/entrance context and cannot be
 * a plain table lookup on the track number alone.
 *
 * Ported from the C core's RemapMsuDeluxeTrack so the JS audio engine reproduces the same
 * numbering as every other MSU-1 implementation.
 */

/** Per music slot: 0 = leave alone, 1 = replace by overworld area, 2 = replace by entrance. */
const TRACK_REMAP_KIND: readonly number[] = [
  0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0,
  2, 2, 2, 0, 0, 0, 2, 2, 0, 0, 0, 2, 0, 0, 0, 0,
];

/** Replacement track per overworld area index (light world, dark world, then special areas). */
const OVERWORLD_AREA_TRACKS: readonly number[] = [
  37, 37, 42, 38, 38, 38, 38, 39, 37, 37, 42, 38, 38, 38, 38, 41,
  42, 42, 42, 42, 42, 42, 40, 40, 43, 43, 42, 47, 47, 42, 45, 45,
  43, 43, 43, 47, 47, 42, 45, 45, 112, 112, 48, 42, 42, 42, 42, 45,
  44, 44, 48, 48, 48, 46, 46, 46, 44, 44, 44, 48, 48, 46, 46, 46,
  49, 49, 51, 50, 50, 50, 50, 50, 49, 49, 51, 50, 50, 50, 50, 51,
  51, 51, 51, 51, 51, 51, 51, 51, 52, 52, 51, 56, 56, 51, 54, 54,
  52, 52, 52, 56, 56, 51, 54, 54, 58, 52, 57, 51, 51, 51, 51, 54,
  53, 53, 57, 57, 57, 55, 55, 110, 53, 53, 57, 57, 57, 55, 55, 110,
  37, 41, 41, 42, 42, 42, 42, 42, 42, 41, 41, 42, 42, 42, 42, 42,
  42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42,
];

/** Replacement track per entrance index. 242 means "no replacement, keep the original". */
const ENTRANCE_TRACKS: readonly number[] = [
  59, 59, 60, 61, 61, 61, 62, 62, 63, 64, 64, 64, 105, 65, 65, 66,
  66, 62, 67, 62, 62, 68, 62, 62, 68, 68, 62, 62, 62, 62, 62, 62,
  62, 62, 62, 62, 69, 70, 71, 72, 73, 73, 73, 106, 102, 74, 62, 62,
  75, 75, 76, 77, 78, 68, 79, 80, 81, 62, 62, 62, 82, 75, 242, 59,
  59, 76, 242, 242, 242, 96, 83, 99, 59, 242, 242, 242, 84, 95, 104, 62,
  85, 62, 62, 86, 242, 67, 103, 83, 83, 87, 76, 88, 81, 98, 81, 88,
  83, 89, 75, 97, 90, 91, 91, 100, 92, 93, 92, 242, 93, 107, 62, 75,
  62, 67, 62, 242, 242, 242, 73, 73, 73, 73, 102, 114, 81, 76, 62, 67,
  62, 61, 94, 62, 103,
];

/** Sentinel in ENTRANCE_TRACKS meaning "leave the original track alone". */
const NO_REPLACEMENT = 242;

interface RemapContext {
  /** Overworld area index, for area-based replacement. */
  overworldArea: number;
  /** Entrance index, for interior-based replacement. */
  entrance: number;
}

/**
 * The Deluxe replacement for `track`, or `track` itself when none applies. Callers that
 * aren't playing a Deluxe pack should not call this at all.
 */
const remapDeluxeTrack = (track: number, ctx: RemapContext): number => {
  const kind = track < TRACK_REMAP_KIND.length ? TRACK_REMAP_KIND[track] : 0;
  if (kind === 1) {
    return ctx.overworldArea < OVERWORLD_AREA_TRACKS.length ? OVERWORLD_AREA_TRACKS[ctx.overworldArea] : track;
  }
  if (kind === 2) {
    if (ctx.entrance >= ENTRANCE_TRACKS.length) return track;
    const replacement = ENTRANCE_TRACKS[ctx.entrance];
    return replacement === NO_REPLACEMENT ? track : replacement;
  }
  return track;
};

export { remapDeluxeTrack };
export type { RemapContext };
