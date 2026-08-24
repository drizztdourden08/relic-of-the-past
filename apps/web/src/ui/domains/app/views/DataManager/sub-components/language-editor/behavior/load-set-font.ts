/* @layer renderer-components @kind logic */
/**
 * Resolves everything a preview needs to draw a set's text with the set's own
 * font: the glyph tiles, the per-glyph advance table, and the alphabet that
 * turns a character into a glyph index.
 *
 * Two sources meet here. The tiles and widths are the set's own bytes on disk;
 * the alphabet belongs to the base language the set inherits from, so it comes
 * out of the extraction language table via the set's `base` code — the same
 * resolution the entry validator does.
 *
 * Cached at module scope, keyed by set id, holding the pending promise rather
 * than the settled value so two callers in the same tick share one read. The
 * font is not editable in the studio (only text is), so a cached entry cannot
 * go stale under an edit; re-importing a set is what would need it dropped.
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

/**
 * The base language code, preferring one the caller already holds — the editor
 * has the loaded set in hand, and reading it again here would pull its whole
 * dialogue payload off disk for one field.
 */
const resolveBase = async (setId: string, base?: string): Promise<string | null> =>
  base ?? (await getLanguageSet(setId))?.base ?? null;

const read = async (setId: string, base?: string): Promise<SetFontAssets | null> => {
  const font = await getLanguageSetFont(setId);
  if (!font) return null;
  const code = await resolveBase(setId, base);
  const config = code ? kLanguages[code] ?? null : null;
  if (!config) return null;
  // Copied rather than kept as handed over: the host may pass a pooled view
  // whose byteOffset is not zero, and every offset below is tile-relative.
  return {
    sheet: { tiles: Uint8Array.from(font.fontData) },
    metrics: { widths: Uint8Array.from(font.fontWidth), alphabet: config.alphabet },
  };
};

/**
 * The set's font, or null when the set has no font pair stored or declares a
 * base language the extraction table does not know — both of which a caller
 * answers by drawing nothing rather than by failing.
 */
const loadSetFont = (setId: string, base?: string): Promise<SetFontAssets | null> => {
  const cached = assetsBySetId.get(setId);
  if (cached) return cached;
  const pending = read(setId, base).catch(() => null);
  assetsBySetId.set(setId, pending);
  return pending;
};

export { loadSetFont };
export type { SetFontAssets };
