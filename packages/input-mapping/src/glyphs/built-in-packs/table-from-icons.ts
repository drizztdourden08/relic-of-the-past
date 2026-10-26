/* @layer shared-input @kind logic */
import { glyphAssetPath } from '../glyph-asset-paths';
import { builtInGlyphSource } from './built-in-glyph-source';
import type { SdlAxisName, SdlButtonName } from '@rotp/game-data';
import type { GlyphTable, IconKeyTable } from './built-in-packs.type';

const tableFromIcons = (...tables: readonly (IconKeyTable | undefined)[]): GlyphTable => {
  const glyphs: GlyphTable = {};
  for (const table of tables) {
    for (const [position, iconKey] of Object.entries(table ?? {})) {
      const assetPath = iconKey ? glyphAssetPath(iconKey) : null;
      if (assetPath) glyphs[position as SdlButtonName | SdlAxisName] = builtInGlyphSource(assetPath);
    }
  }
  return glyphs;
};

export { tableFromIcons };
