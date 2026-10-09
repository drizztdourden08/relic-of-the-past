/* @layer renderer-components @kind logic */
import { setFontAssets } from '@domains/packs/language/behavior/set-font-assets';
import type { SetFontAssets } from '@domains/packs/language/behavior/set-font-assets';
import { getLanguageSet, getLanguageSetFont } from '@app/lib/storage/languages-store';

const assetsBySetId = new Map<string, Promise<SetFontAssets | null>>();

const resolveBase = async (setId: string, base?: string): Promise<string | null> =>
  base ?? (await getLanguageSet(setId))?.base ?? null;

const read = async (setId: string, base?: string): Promise<SetFontAssets | null> => {
  const font = await getLanguageSetFont(setId);
  if (!font) return null;
  return setFontAssets(font, await resolveBase(setId, base));
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
