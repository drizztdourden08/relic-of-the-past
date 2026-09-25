/* @layer shared-hud @kind logic */
/**
 * `text`'s content and declared size, both pure - shared by `intrinsic-
 * size.ts` (which needs a box before anything can draw) and the renderer's
 * `HudText` compound (which needs the very same string and the very same
 * per-character geometry, or the two would drift apart the moment someone
 * changed one and not the other).
 *
 * THE SIZE IS AN ESTIMATE, NOT A MEASUREMENT. This file has no DOM and no
 * canvas - the same constraint every other element's intrinsic size already
 * lives under (`element-sizes.ts`'s constants are human-measured off what the
 * compound renders, not computed from live content). The numbers below are
 * chosen to track the renderer's actual choices closely, not to be exact for
 * a real font - "contain, centred" tolerates a mismatch by letterboxing
 * instead of distorting anything.
 */

import { resolveValue } from '../data/resolve-value';
import type { HudTextFace, HudTextFormat, HudTextSpec, HudTextSpriteSet } from '../../types/hud/hud-text';
import type { Size } from '../layouts/geometry.type';

/** One 8px tile per character, matching `HudNumber`'s digit tile and
 *  `PauseText`'s `GLYPH_SIZE` - both extracted sets share this height. */
const SPRITE_GLYPH_SIZE = 8;

/** '&' draws across two tiles in the pause-letters set, matching `PauseText`. */
const AMPERSAND_COLUMNS = 2;

/** A coarse average glyph-width : font-size ratio for the two real UI faces
 *  and the pixel face alike - not exact, see the file header. */
const FONT_ADVANCE_RATIO = 0.6;
const FONT_LINE_HEIGHT_RATIO = 1.2;

/** ALttP Dialogue's own em box (`--game-cell-h`, `game-text.css`) - the face
 *  only looks right at a whole multiple of this. */
const GAME_FONT_DESIGN_SIZE = 16;

/** Rounds a `game`-face size to the nearest whole multiple of its design
 *  size, never below one - the pixel-snap the plan asks for. */
const snapGameFontSize = (size: number): number => (
  Math.max(GAME_FONT_DESIGN_SIZE, Math.round(size / GAME_FONT_DESIGN_SIZE) * GAME_FONT_DESIGN_SIZE)
);

/** The sprite stem for one character, or null when this set draws nothing
 *  for it - the digit set has no letters at all, matching `HudNumber`. */
const stemForSpriteChar = (set: HudTextSpriteSet, char: string): string | null => {
  if (set === 'hud-digits') return /^[0-9]$/.test(char) ? `font-digit-${char}` : null;
  if (char === '&') return 'font-symbol-ampersand';
  const upper = char.toUpperCase();
  if (/^[A-Z]$/.test(upper)) return `font-letter-${upper.toLowerCase()}`;
  if (/^[0-9]$/.test(upper)) return `font-digit-${upper}`;
  return null;
};

/** How many tile columns one character occupies - only '&' is wider. */
const columnsForSpriteChar = (char: string): number => (char === '&' ? AMPERSAND_COLUMNS : 1);

const formatNumber = (n: number, format?: HudTextFormat): string => {
  const whole = String(Math.max(0, Math.round(n)));
  const digits = format?.digits;
  const pad = format?.pad ?? 'none';
  if (digits === undefined || pad === 'none' || whole.length >= digits) return whole;
  return whole.padStart(digits, pad === 'zero' ? '0' : ' ');
};

/** The exact string a `text` element draws - a literal `value` as-is, or a
 *  resolved number run through `format`. */
const resolveTextContent = (spec: HudTextSpec, scope: Readonly<Record<string, number>>): string => (
  typeof spec.value === 'string' ? spec.value : formatNumber(resolveValue(spec.value, scope), spec.format)
);

/** The box a `text` element declares before anything measures it. */
const textIntrinsicSize = (text: string, face: HudTextFace): Size => {
  if (face.from === 'sprite') {
    const cols = (text || ' ').split('').reduce((sum, ch) => sum + columnsForSpriteChar(ch), 0);
    return { w: Math.max(1, cols) * SPRITE_GLYPH_SIZE, h: SPRITE_GLYPH_SIZE };
  }
  const size = face.family === 'game' ? snapGameFontSize(face.size) : face.size;
  const chars = Math.max(1, text.length);
  return { w: chars * size * FONT_ADVANCE_RATIO, h: size * FONT_LINE_HEIGHT_RATIO };
};

export {
  columnsForSpriteChar, resolveTextContent, SPRITE_GLYPH_SIZE, snapGameFontSize, stemForSpriteChar, textIntrinsicSize,
};
