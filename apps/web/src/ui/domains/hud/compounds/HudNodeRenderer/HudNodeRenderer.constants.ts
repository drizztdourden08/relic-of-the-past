/* @layer renderer-hud @kind constants */
/**
 * The two constants the button map is drawn with, and neither is geometry.
 *
 * ── THE ONE DIM ───────────────────────────────────────────────────────────
 *
 * 0.4 was tuned back when only ASSIGNED buttons drew and a dim glyph meant "you
 * do not own this yet". That was a rare state, and one the eye was allowed to skip.
 * Since contract section 15.4 the map draws every assignable control all the
 * time, so on a pad most of it is dim, and it sits over the brightest terrain
 * in the game. At 0.4 the three free d-pad chips over grass and tree canopy
 * were effectively gone, which defeats the reason the map stopped hiding them:
 * an empty button is the answer to "where could I put this?".
 *
 * 0.7 is legible against that ground while still reading as clearly not
 * assigned. The item sprite, not the glyph, is what says "assigned", and an
 * unassigned control still wears none. ONE value for the whole map: the d-pad's
 * shared cross uses it for its group and a face disc uses it for itself, so the
 * two cannot drift apart.
 *
 * ── THE GLYPH THAT IS NOT A POSITION ──────────────────────────────────────
 *
 * A glyph pack (`shared/input/glyphs/`) is keyed by SDL POSITION (`DPAD_UP`,
 * `EAST`, `LEFT_SHOULDER`) because that is what a device enumerates and what a
 * binding row names. "The whole d-pad" is not a position; nothing can be bound
 * to it and no device reports it. Adding a synthetic key for it would put a
 * thing that is not a control into the one table whose entire job is to
 * describe controls, so a document names it with the synthetic `DPAD` position
 * and it resolves here instead.
 *
 * One picture for every family, because of the six packs that ship exactly ONE
 * (`snes`) has whole-d-pad art and the other five draw only the four
 * directional arrows. There is no per-family answer to resolve to, and
 * promoting one console's pad to stand for every family would draw the wrong
 * hardware for five players out of six. The cross below is drawn for this
 * project in the generic pack's own style, with no family's accent colour on
 * it, which is what `generic` is for: the fallback every family reaches.
 *
 * The path is root-relative, exactly like `glyph-asset-paths.ts` produces, so
 * `HudGlyph` prefixes it with the app's base the same way it does any other.
 */
import type { GlyphSource, HudGlyphPosition } from '@shared/types/hud';

const DIMMED_GLYPH_OPACITY = 0.7;

const GROUP_GLYPH_ART: Partial<Record<HudGlyphPosition, GlyphSource>> = {
  DPAD: { kind: 'built-in', assetPath: 'buttons/generic/generic_dpad.svg' },
};

export { DIMMED_GLYPH_OPACITY, GROUP_GLYPH_ART };
