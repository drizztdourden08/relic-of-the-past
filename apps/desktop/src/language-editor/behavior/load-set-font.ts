/* @layer renderer-components @kind logic */
import { setFontAssets } from '@rotp/design/packs';
import type { SetFontAssets } from '@rotp/design/packs';
import { getLanguageRomFont } from '@app/storage/languages-store';

const assetsByBase = new Map<string, Promise<SetFontAssets | null>>();

const read = async (base: string): Promise<SetFontAssets | null> => {
  const font = await getLanguageRomFont(base);
  return font ? setFontAssets(font, base) : null;
};

const loadSetFont = (base: string): Promise<SetFontAssets | null> => {
  const cached = assetsByBase.get(base);
  if (cached) return cached;
  const pending = read(base).catch(() => null);
  assetsByBase.set(base, pending);
  return pending;
};

export { loadSetFont };
export type { SetFontAssets };
