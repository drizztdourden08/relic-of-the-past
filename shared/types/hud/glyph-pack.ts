/* @layer shared-types @kind types */
/**
 * A glyph pack maps SDL's positional control names to the artwork drawn for
 * them. Keying by position (never by a printed letter) is what lets one pack
 * serve every device family without claiming a control exists.
 */

import type { SdlAxisName, SdlButtonName } from '../../input/sdl-buttons';

type GlyphSource = { kind: 'built-in'; assetPath: string } | { kind: 'custom'; fileKey: string };

interface GlyphPack {
  id: string; name: string; builtIn: boolean;
  glyphs: Partial<Record<SdlButtonName | SdlAxisName, GlyphSource>>;
  fallbackPack?: string;
}

export type { GlyphPack, GlyphSource };
