/* @layer renderer-components @kind logic */
import { setFontAssets } from '@rotp/design/packs';
import type { SetFontAssets } from '@rotp/design/packs';
import { getLanguageSet, getLanguageSetFont } from '@app/storage/languages-store';

const assetsBySetId = new Map<string, Promise<SetFontAssets | null>>();

const read = async (setId: string, base?: string): Promise<SetFontAssets | null> => {
  const font = await getLanguageSetFont(setId);
  if (!font) return null;
  const set = await getLanguageSet(setId);
  return setFontAssets(font, base ?? set?.base ?? null, set?.glyphs);
};

const loadSetFont = (setId: string, base?: string): Promise<SetFontAssets | null> => {
  const cached = assetsBySetId.get(setId);
  if (cached) return cached;
  const pending = read(setId, base).catch(() => null);
  assetsBySetId.set(setId, pending);
  return pending;
};

export { loadSetFont };
export type { SetFontAssets };
