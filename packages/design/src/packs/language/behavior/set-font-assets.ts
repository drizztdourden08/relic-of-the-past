/* @layer renderer-components @kind logic */
import { alphabetWithGlyphs, kLanguages } from '@rotp/asset-extraction';
import type { GlyphMap } from '@rotp/asset-extraction';
import type { SetFontBytes } from '@rotp/languages';
import type { SetFontAssets } from './language-behavior.type';

const setFontAssets = (font: SetFontBytes, base: string | null, glyphs?: GlyphMap): SetFontAssets | null => {
  const config = base ? kLanguages[base] ?? null : null;
  if (!config) return null;
  return {
    sheet: { tiles: Uint8Array.from(font.fontData) },
    metrics: { widths: Uint8Array.from(font.fontWidth), alphabet: alphabetWithGlyphs(config.alphabet, glyphs) },
  };
};

export { setFontAssets };
export type { SetFontAssets } from './language-behavior.type';
