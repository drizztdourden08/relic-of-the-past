/* @layer renderer-components @kind logic */
/**
 * A set's drawable font: the glyph tiles and widths (the set's own bytes) plus
 * the alphabet (from the extraction language table via the set's `base` code).
 * Cached at module scope by set id, holding the pending promise so two callers
 * in one tick share one read. The font is not editable in the studio, so a
 * cached entry cannot go stale under an edit; only a re-import would need it dropped.
 */
import type { GlyphMetrics, GlyphSheet } from '@shared/game/language/layout/types';
import { kLanguages } from '@shared/asset-extraction/text/data/language-data';
import { getLanguageSet, getLanguageSetFont } from '@app/lib/storage/languages-store';

/** One set's drawable font: the tiles, and the metrics to place them. */
type SetFontAssets = {
  sheet: GlyphSheet;
  metrics: GlyphMetrics;
};

/** Pending-or-settled reads, so a remount never re-reads the same font. */
const assetsBySetId = new Map<string, Promise<SetFontAssets | null>>();

/** The base language code, preferring one the caller already holds; re-reading the set would pull its whole payload for one field. */
const resolveBase = async (setId: string, base?: string): Promise<string | null> =>
  base ?? (await getLanguageSet(setId))?.base ?? null;

const read = async (setId: string, base?: string): Promise<SetFontAssets | null> => {
  const font = await getLanguageSetFont(setId);
  if (!font) return null;
  const code = await resolveBase(setId, base);
  const config = code ? kLanguages[code] ?? null : null;
  if (!config) return null;
  // Copied: the host may pass a pooled view whose byteOffset is not zero, and
  // every offset below is tile-relative.
  return {
    sheet: { tiles: Uint8Array.from(font.fontData) },
    metrics: { widths: Uint8Array.from(font.fontWidth), alphabet: config.alphabet },
  };
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
