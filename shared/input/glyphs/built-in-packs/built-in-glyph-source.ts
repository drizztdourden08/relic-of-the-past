/* @layer shared-input @kind logic */
import type { GlyphSource } from '@shared/types/hud/glyph-pack';

const builtInGlyphSource = (assetPath: string): GlyphSource => ({ kind: 'built-in', assetPath });

export { builtInGlyphSource };
