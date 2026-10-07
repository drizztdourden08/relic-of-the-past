/* @layer shared-game @kind data */
/**
 * The enhanced message box's look, as the settings name it: the border around the text, its
 * corners and corner marks, and the texture drawn on the ground. Every choice is a closed ladder
 * so a segmented control can list it and a stored value never drifts off it.
 */

/** The game's own tiles, nothing, one line, or a thin line inside a thicker one. */
const DIALOG_BORDERS = ['original', 'none', 'single', 'double'] as const;
const DIALOG_BORDER_THICKNESSES = ['thin', 'medium', 'thick'] as const;
/** Square corners, rounded ones, or corners cut at a diagonal (a chamfer). */
const DIALOG_CORNERS = ['square', 'rounded', 'chamfered'] as const;
/** A small mark inside each corner; the triforce points at its corner. */
const DIALOG_CORNER_MARKS = ['none', 'circle', 'square', 'triforce'] as const;
/** The repeating pattern drawn on the ground behind the text. */
const DIALOG_TEXTURES = ['none', 'triforce-outline', 'triforce-filled', 'hex', 'scanlines', 'stripes'] as const;
/** How the texture moves: slides sideways, drifts diagonally, cells appear and fade at random, or the whole field breathes. */
const DIALOG_TEXTURE_ANIMATIONS = ['none', 'scroll', 'drift', 'twinkle', 'pulse'] as const;
const DIALOG_TEXTURE_SPEEDS = ['slow', 'normal', 'fast'] as const;

type DialogBorder = (typeof DIALOG_BORDERS)[number];
type DialogBorderThickness = (typeof DIALOG_BORDER_THICKNESSES)[number];
type DialogCorner = (typeof DIALOG_CORNERS)[number];
type DialogCornerMark = (typeof DIALOG_CORNER_MARKS)[number];
type DialogTexture = (typeof DIALOG_TEXTURES)[number];
type DialogTextureAnimation = (typeof DIALOG_TEXTURE_ANIMATIONS)[number];
type DialogTextureSpeed = (typeof DIALOG_TEXTURE_SPEEDS)[number];

/** Stroke widths in game pixels: the outer line, the thin inner line of a double border, and the gap between them. */
const strokeWidthsOf = (thickness: DialogBorderThickness): { outer: number; inner: number; gap: number } => {
  if (thickness === 'thick') return { outer: 4, inner: 2, gap: 1.5 };
  if (thickness === 'medium') return { outer: 2, inner: 1, gap: 1 };
  return { outer: 1, inner: 0.5, gap: 0.75 };
};

/** Multiplier a texture animation runs at. */
const textureSpeedFactor = (speed: DialogTextureSpeed): number =>
  speed === 'slow' ? 0.5 : speed === 'fast' ? 2 : 1;

export {
  DIALOG_BORDERS, DIALOG_BORDER_THICKNESSES, DIALOG_CORNERS, DIALOG_CORNER_MARKS,
  DIALOG_TEXTURES, DIALOG_TEXTURE_ANIMATIONS, DIALOG_TEXTURE_SPEEDS,
  strokeWidthsOf, textureSpeedFactor,
};
export type {
  DialogBorder, DialogBorderThickness, DialogCorner, DialogCornerMark,
  DialogTexture, DialogTextureAnimation, DialogTextureSpeed,
};
