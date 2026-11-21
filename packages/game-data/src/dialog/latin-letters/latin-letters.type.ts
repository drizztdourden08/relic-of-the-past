/* @layer shared-game @kind types */
type MarkPlace = 'above' | 'below' | 'attached' | 'ogonek';

type OverlayId =
  | 'slash' | 'stroke' | 'barAscender' | 'barCenter' | 'barStem' | 'barLeftStem' | 'barRight'
  | 'middleDot' | 'apostropheRight' | 'apostropheLeft' | 'horn' | 'hookTopLeft'
  | 'hookBelowLeft' | 'hookBelowRight' | 'dotless';

type LetterTransform = 'mirror' | 'turn';

type BuiltOp = OverlayId | LetterTransform;

interface MarkArt {
  place: MarkPlace;
  rows: readonly string[];
  compact?: readonly string[];
}

interface DrawnLetter {
  char: string;
  fallback: string;
  top: number;
  rows: readonly string[];
}

type LetterRecipe =
  | { kind: 'marks'; base: string; marks: readonly string[] }
  | { kind: 'overlay'; base: string; overlay: OverlayId }
  | { kind: 'transform'; base: string; transform: LetterTransform }
  | { kind: 'drawn'; letter: DrawnLetter };

interface LetterFont {
  sheet: Uint8Array;
  widths: Uint8Array;
  alphabet: readonly string[];
}

interface LetterShape {
  mask: Uint8Array;
  width: number;
  fallback: string;
}

interface LetterGlyph {
  char: string;
  width: number;
  fallbackGlyph: number;
  tiles: Uint8Array;
}

interface MarkedMask {
  mask: Uint8Array;
  shift: number;
}

export type {
  BuiltOp, DrawnLetter, LetterFont, LetterGlyph, LetterRecipe, LetterShape, LetterTransform, MarkArt, MarkedMask,
  MarkPlace, OverlayId,
};
