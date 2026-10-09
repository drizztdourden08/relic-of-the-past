/* @layer shared-input @kind logic */
import type { GlyphSource } from '../../types/glyph-pack';

const builtInGlyphSource = (assetPath: string): GlyphSource => ({ kind: 'built-in', assetPath });

export { builtInGlyphSource };
