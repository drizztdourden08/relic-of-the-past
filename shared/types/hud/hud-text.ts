/* @layer shared-types @kind types */
/**
 * `text` is a string or a number, drawn in either the game's own extracted
 * glyph sprites or a real font. A "counter" is this with a numeric `value`;
 * the toolbar still offers a Counter button, which inserts one already set to
 * digits and zero-padding (`plans/hud-data-binding.html`, "why counter became
 * text").
 *
 * TWO FACES, NEITHER SPECIAL. `sprite` draws the HUD's own extracted glyph
 * sets (`fonts` sprite category) - pixel-exact, and limited to the characters
 * the game has. `font` draws a real face: the bundled pixel recreation
 * (`'game'`, `--font-game` in `game-font.css`) or the app's own UI sans/mono.
 * There is no library of "other" fonts - only these three - see the plan's own
 * correction on this point.
 */

import type { Paint, Value } from './hud-value';

type HudTextPad = 'none' | 'zero' | 'space';

/** Meaningful only when `value` resolves to a number - a bare string `value`
 *  ignores it and draws exactly as given. */
interface HudTextFormat { digits?: number; pad?: HudTextPad }

/** Which extracted glyph set a `sprite` face draws from - the HUD's own
 *  digits (`font-digit-N[.png]`, no letters) or the pause menu's full
 *  alphanumeric set (letters, digits, space, `&`) - never both, because they
 *  are two different extracted sheets. */
type HudTextSpriteSet = 'hud-digits' | 'pause-letters';

/** ALttP Dialogue is a pixel face: it only looks right at a whole multiple of
 *  its own 16px design size (`--game-cell-h` in `game-text.css`), which the
 *  renderer snaps `size` to for this family - see `resolve-text.ts`. */
type HudFontFamily = 'game' | 'sans' | 'mono';

type HudTextFace =
  | { from: 'sprite'; set: HudTextSpriteSet }
  | { from: 'font'; family: HudFontFamily; size: number; weight?: number };

/** The existing `.game-text` rule (white fill, blue edge, shadow ring) is the
 *  DEFAULT when a `font: 'game'` face carries no `stroke` of its own - not a
 *  special case, just this shape with its own numbers. */
interface HudTextStroke { width: Value; color: Paint }

type HudTextAlign = 'start' | 'center' | 'end';

interface HudTextSpec {
  type: 'text';
  value: Value | string;
  format?: HudTextFormat;
  face: HudTextFace;
  color?: Paint;
  stroke?: HudTextStroke;
  align?: HudTextAlign;
  /** Extra letter-spacing, SNES px. The sprite face ignores it - a pixel grid
   *  of fixed-width tiles has no tracking to add. */
  tracking?: number;
}

export type {
  HudFontFamily, HudTextAlign, HudTextFace, HudTextFormat, HudTextPad, HudTextSpec, HudTextSpriteSet, HudTextStroke,
};
