/* @layer renderer-components @kind logic */
import { setFontAssets } from '@rotp/design/packs';
import type { SetFontAssets } from '@rotp/design/packs';
import type { GlyphMap } from '@rotp/asset-extraction';
import { getLanguageSet, getLanguageSetFont } from '@app/storage/languages-store';

const assetsByKey = new Map<string, Promise<SetFontAssets | null>>();

const read = async (setId: string, base?: string, glyphs?: GlyphMap): Promise<SetFontAssets | null> => {
  const font = await getLanguageSetFont(setId);
  if (!font) return null;
  const set = glyphs && base ? null : await getLanguageSet(setId);
  return setFontAssets(font, base ?? set?.base ?? null, glyphs ?? set?.glyphs);
};

const loadSetFont = (setId: string, base?: string, glyphs?: GlyphMap): Promise<SetFontAssets | null> => {
  const key = `${setId}|${base ?? ''}|${glyphs ? JSON.stringify(glyphs) : ''}`;
  const cached = assetsByKey.get(key);
  if (cached) return cached;
  const pending = read(setId, base, glyphs).catch(() => null);
  assetsByKey.set(key, pending);
  return pending;
};

export { loadSetFont };
export type { SetFontAssets };
