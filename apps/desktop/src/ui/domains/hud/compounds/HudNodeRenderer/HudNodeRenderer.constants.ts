/* @layer renderer-hud @kind constants */
import type { GlyphSource, HudGlyphPosition } from '@shared/types/hud';

const DIMMED_GLYPH_OPACITY = 0.7;

const GROUP_GLYPH_ART: Partial<Record<HudGlyphPosition, GlyphSource>> = {
  DPAD: { kind: 'built-in', assetPath: 'buttons/generic/generic_dpad.svg' },
};

const ORIGIN = { x: 0, y: 0 };
const EMPTY_SCOPE: Readonly<Record<string, number>> = {};

export { DIMMED_GLYPH_OPACITY, EMPTY_SCOPE, GROUP_GLYPH_ART, ORIGIN };
