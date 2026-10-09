/* @layer shared-game @kind types */
import type {
  DIALOG_BORDERS, DIALOG_BORDER_THICKNESSES, DIALOG_CORNERS, DIALOG_CORNER_MARKS,
  DIALOG_TEXTURES, DIALOG_TEXTURE_ANIMATIONS, DIALOG_TEXTURE_SPEEDS,
} from './box-style.constants';

type DialogBorder = (typeof DIALOG_BORDERS)[number];
type DialogBorderThickness = (typeof DIALOG_BORDER_THICKNESSES)[number];
type DialogCorner = (typeof DIALOG_CORNERS)[number];
type DialogCornerMark = (typeof DIALOG_CORNER_MARKS)[number];
type DialogTexture = (typeof DIALOG_TEXTURES)[number];
type DialogTextureAnimation = (typeof DIALOG_TEXTURE_ANIMATIONS)[number];
type DialogTextureSpeed = (typeof DIALOG_TEXTURE_SPEEDS)[number];

interface StrokeWidths {
  outer: number;
  inner: number;
  gap: number;
}

export type {
  DialogBorder, DialogBorderThickness, DialogCorner, DialogCornerMark,
  DialogTexture, DialogTextureAnimation, DialogTextureSpeed, StrokeWidths,
};
