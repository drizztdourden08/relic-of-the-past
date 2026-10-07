/* @layer renderer-components @kind logic */
/**
 * A set's drawable font, read from the set's stored pair (see `setFontAssets`).
 * Cached at module scope by set id, holding the pending promise so two callers
 * in one tick share one read. The font is not editable in the studio, so a
 * cached entry cannot go stale under an edit; only a re-import would need it dropped.
 */
import { setFontAssets } from '@domains/packs/language/behavior/set-font-assets';
import type { SetFontAssets } from '@domains/packs/language/behavior/set-font-assets';
import { getLanguageSet, getLanguageSetFont } from '@app/lib/storage/languages-store';

/** Pending-or-settled reads, so a remount never re-reads the same font. */
const assetsBySetId = new Map<string, Promise<SetFontAssets | null>>();

/** The base language code, preferring one the caller already holds; re-reading the set would pull its whole payload for one field. */
const resolveBase = async (setId: string, base?: string): Promise<string | null> =>
  base ?? (await getLanguageSet(setId))?.base ?? null;

const read = async (setId: string, base?: string): Promise<SetFontAssets | null> => {
  const font = await getLanguageSetFont(setId);
  if (!font) return null;
  return setFontAssets(font, await resolveBase(setId, base));
};

/** The set's font, or null when no font pair is stored or the base language is unknown; callers then draw nothing. */
const loadSetFont = (setId: string, base?: string): Promise<SetFontAssets | null> => {
  const cached = assetsBySetId.get(setId);
  if (cached) return cached;
  const pending = read(setId, base).catch(() => null);
  assetsBySetId.set(setId, pending);
  return pending;
};

export { loadSetFont };
export type { SetFontAssets };
