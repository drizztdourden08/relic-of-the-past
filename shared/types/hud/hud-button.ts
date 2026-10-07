/* @layer shared-types @kind types */
/**
 * `button` draws a control's face, with a face per state. Replaces the old
 * `glyph` element as "a control's picture"; `{ type: 'slot', index }` (the
 * ITEM sprite a slot holds) is untouched and stays a separate object, placed
 * wherever the author likes - binding both by the same numbered slot is what
 * makes that free (`plans/hud-data-binding.html`, "the button object").
 *
 * A BIND NAMES WHICH CONTROL, NOT WHICH DEVICE. `verb` is one of the six core
 * actions every scheme has; `slot` is "whatever slot N fires", and N is never
 * capped or checked against a real device - a keyboard has 107 glyphs, and a
 * layout may name a slot nothing is plugged into.
 *
 * A FACE IS A PICTURE THE AUTHOR CHOSE, not an auto-resolved binding. `image`
 * is the author's own art; `glyph` names a pack and a position exactly the
 * way the existing `glyph` element does, picked visually from the same grid
 * - never typed by name.
 */

type HudButtonVerb = 'up' | 'down' | 'left' | 'right' | 'pause' | 'map';

type HudButtonBind = { kind: 'verb'; verb: HudButtonVerb } | { kind: 'slot'; index: number };

type HudButtonState = 'idle' | 'pressed' | 'held' | 'unassigned';

/** `glyph` names a pack and an SDL position (or `'DPAD'`) exactly as
 *  `HudGlyphPosition` does (`hud-node.ts`) - kept as a plain `string` here so
 *  this file never has to import that recursive union back; the validator
 *  checks it against the same set either way. */
type HudButtonFace = { from: 'image'; file: string } | { from: 'glyph'; pack: string; glyph: string };

/**
 * `idle` is the only state every button must have. A state left out FALLS
 * BACK TO `idle` - `held` costs nothing until an author actually wants it,
 * and `unassigned` (drawn when the bound slot fires nothing right now)
 * supersedes the old `dimWhenEmpty` flag for a button specifically: it can be
 * a different picture, not merely a dimmer one.
 */
interface HudButtonStates {
  idle: HudButtonFace;
  pressed?: HudButtonFace;
  held?: HudButtonFace;
  unassigned?: HudButtonFace;
}

interface HudButtonSpec {
  type: 'button';
  bind: HudButtonBind;
  states: HudButtonStates;
}

export type { HudButtonBind, HudButtonFace, HudButtonSpec, HudButtonState, HudButtonStates, HudButtonVerb };
