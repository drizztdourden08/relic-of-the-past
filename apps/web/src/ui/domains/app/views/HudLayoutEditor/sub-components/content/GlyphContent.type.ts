/* @layer renderer-components @kind types */
import type { GlyphPack, HudElementSpec } from '@shared/types/hud';

type GlyphSpec = Extract<HudElementSpec, { type: 'glyph' }>;

interface GlyphContentProps {
  spec: GlyphSpec;
  onChange: (patch: Partial<GlyphSpec>) => void;
  glyphPacks: readonly GlyphPack[];
}

export type { GlyphContentProps, GlyphSpec };
