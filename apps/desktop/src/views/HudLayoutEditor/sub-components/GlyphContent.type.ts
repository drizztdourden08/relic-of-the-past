/* @layer renderer-components @kind types */
import type { GlyphPack } from '@rotp/input-mapping';
import type { HudElementSpec } from '@rotp/hud';

type GlyphSpec = Extract<HudElementSpec, { type: 'glyph' }>;

interface GlyphContentProps {
  spec: GlyphSpec;
  onChange: (patch: Partial<GlyphSpec>) => void;
  glyphPacks: readonly GlyphPack[];
}

export type { GlyphContentProps };
