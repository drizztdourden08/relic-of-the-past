/* @layer shared-types @kind types */
import type { SdlAxisName, SdlButtonName } from '../../../input/sdl-buttons';

type GlyphSource = { kind: 'built-in'; assetPath: string } | { kind: 'custom'; fileKey: string };

interface GlyphPack {
  id: string; name: string; builtIn: boolean;
  glyphs: Partial<Record<SdlButtonName | SdlAxisName, GlyphSource>>;
  fallbackPack?: string;
}

export type { GlyphPack, GlyphSource };
