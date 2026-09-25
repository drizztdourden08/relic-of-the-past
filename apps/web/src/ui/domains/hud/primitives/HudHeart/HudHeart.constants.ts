/* @layer renderer-hud @kind constants */
/**
 * The heart's drawing. One silhouette, one palette, three armour tints.
 *
 * VECTOR, NOT PIXEL ART, and that is a decision, not convenience. The
 * pixel-art pipeline next door (`svg-pixel-art.ts`) reads a flat list of
 * integer `<rect>`s and bakes them into a bitmap at extraction time; it can
 * express neither of the two things this heart is asked for. A fill stage is a
 * cut at an arbitrary fraction of the width, which a grid eight columns wide
 * quantises away to the same three states the sprites already had; and the
 * three armour tints are the SAME drawing recoloured, which a baked bitmap can
 * only answer with three more baked bitmaps. Both fall out of a path and two
 * colour slots for free.
 *
 * Colours live here as named constants instead of design tokens, for the
 * reason `HudMagicBar.constants.ts` already gives: this is a HUD drawn over
 * emulated hardware output, and a token that moves with the app theme would put
 * app-coloured chrome on top of game-coloured pixels.
 *
 * The tint is deliberately SLIGHT. It is carried by the rim, the highlight and
 * the shaded flank; the body stays red at every armour tier, because a heart
 * that turns silver stops reading as a heart and starts reading as a different
 * resource.
 */

/**
 * The drawing grid: two units to one SNES pixel. A heart draws at 8x8 SNES px,
 * and a curve described on an 8-unit grid has nowhere to put the shoulder of a
 * lobe, so the path is authored at 16 and scaled down, which costs nothing and
 * keeps the silhouette smooth at any HUD scale.
 */
const HEART_VIEW = 16;

/** The silhouette every layer is cut from. */
const HEART_PATH =
  'M8 14.4C8 14.4 1.6 10.2 1.6 6.1C1.6 3.6 3.5 2 5.5 2C6.7 2 7.6 2.6 8 3.4'
  + 'C8.4 2.6 9.3 2 10.5 2C12.5 2 14.4 3.6 14.4 6.1C14.4 10.2 8 14.4 8 14.4Z';

/** The lower-right flank, where the body turns away from the light. */
const HEART_SHADE_PATH =
  'M8 14.4C8 14.4 14.4 10.2 14.4 6.1C14.4 3.6 12.5 2 10.5 2C9.3 2 8.4 2.6 8 3.4Z';

/** A crescent on the upper-left lobe. It is the first place the tint reads. */
const HEART_HIGHLIGHT_PATH =
  'M4 5.6C4.2 4.3 5.2 3.4 6.4 3.5C6.9 3.6 7.3 3.8 7.5 4.1'
  + 'C6.2 4.5 5.2 5.5 4.9 6.9C4.3 6.7 3.9 6.2 4 5.6Z';

/** Body colours. The red is the console's own heart red, warmed a shade so the
 *  drawn heart does not read as a washed-out copy of the sprite it replaces. */
const HEART_FILL = '#e0283c';
/** Interior of a heart the player has but has not filled. */
const HEART_EMPTY = '#3a1119';
/** The dark surround that keeps a heart legible over bright terrain. */
const HEART_OUTLINE = '#140407';

/** Stroke widths, in grid units (so half of these in SNES pixels). */
const HEART_OUTLINE_WIDTH = 1.4;
const HEART_RIM_WIDTH = 1.2;

const HEART_RIM_OPACITY = 0.9;
const HEART_HIGHLIGHT_OPACITY = 0.9;
const HEART_SHADE_OPACITY = 0.55;

/** How long a fill change takes to travel, in the smooth heart mode. */
const HEART_FILL_MS = 200;

/** One armour tier's three tinted slots. */
interface HeartTint {
  /** Inner rim, drawn over the body's edge at every fill. */
  rim: string;
  /** The crescent on the upper-left lobe. */
  highlight: string;
  /** The shaded flank. It is the tint's quietest slot, and the one that gives the
   *  three tiers different bodies without three different body colours. */
  shade: string;
}

/**
 * Indexed by `GameUIState.equipment.armor`: 0, 1, 2. White, silver, gold. Each is
 * pulled well back toward the red so the heart still reads as a heart.
 */
const HEART_TINTS: readonly HeartTint[] = [
  { rim: '#ffd6dc', highlight: '#fff6f7', shade: '#98192c' },
  { rim: '#b4c6dc', highlight: '#e4eefb', shade: '#7c2140' },
  { rim: '#e6b445', highlight: '#ffe9a2', shade: '#a53a12' },
];

const tintFor = (armor: number): HeartTint =>
  HEART_TINTS[Math.min(Math.max(Math.trunc(armor), 0), HEART_TINTS.length - 1)];

export {
  HEART_EMPTY,
  HEART_FILL,
  HEART_FILL_MS,
  HEART_HIGHLIGHT_OPACITY,
  HEART_HIGHLIGHT_PATH,
  HEART_OUTLINE,
  HEART_OUTLINE_WIDTH,
  HEART_PATH,
  HEART_RIM_OPACITY,
  HEART_RIM_WIDTH,
  HEART_SHADE_OPACITY,
  HEART_SHADE_PATH,
  HEART_TINTS,
  HEART_VIEW,
  tintFor,
};
export type { HeartTint };
