/* @layer renderer-hooks @kind logic */
/**
 * The working sheet: what is open, what has been changed, and how it gets written back.
 *
 * The draft keeps the sheet's two palette layers rather than a mutable palette plus a copy
 * of the old one. `original` is never written to, so Revert is dropping the override and
 * `dirty` is asking whether the override holds anything — no flag to keep in sync.
 *
 * Saving also pushes the sheet at a running game. That only lands when the core's override
 * gate is open, which the renderer opens for the active profile's own selection, so the
 * result is reported back rather than assumed.
 */
import { useState, useCallback, useMemo } from 'react';
import type { OutfitId, PlayerSheet, SheetPalette } from '@shared/game/data/player-sheet/types';
import { loadSheet, saveSheet } from '@app/lib/game/player-sheet/load-sheet';
import { withColor, withGloveColor, isEmptyOverride } from '@app/lib/game/player-sheet/flatten-palette';
import { loadStockSheet } from '@app/lib/game/stock-player-sheet';
import { toZsprBytes } from '@app/lib/game/zspr-write';
import { applyPlayerSprite } from '@app/lib/game/player-sprite';
import { safeFileName } from '@app/lib/storage/link-sprites-store';

interface OpenDraft {
  /** File name on disk, or null for a sheet created but never saved. */
  file: string | null;
  sheet: PlayerSheet;
}

const useSpriteDraft = (romFile: string | null, stockPalette?: SheetPalette) => {
  const [draft, setDraft] = useState<OpenDraft | null>(null);
  const [applied, setApplied] = useState<boolean | null>(null);

  const open = useCallback(async (name: string) => {
    const sheet = await loadSheet(name, stockPalette);
    if (sheet) { setDraft({ file: name, sheet }); setApplied(null); }
    return !!sheet;
  }, [stockPalette]);

  const createNew = useCallback(async () => {
    if (!romFile) return false;
    const stock = await loadStockSheet(romFile);
    if (!stock) return false;
    setDraft({ file: null, sheet: { ...stock, meta: { name: 'Custom sprite', author: '', authorShort: '' } } });
    setApplied(null);
    return true;
  }, [romFile]);

  const close = useCallback(() => { setDraft(null); setApplied(null); }, []);

  const patch = useCallback((next: Partial<PlayerSheet>) => {
    setDraft((d) => (d ? { ...d, sheet: { ...d.sheet, ...next } } : d));
  }, []);

  const setColor = useCallback((outfit: OutfitId, index: number, word: number) => {
    setDraft((d) => (d ? { ...d, sheet: { ...d.sheet, override: withColor(d.sheet, outfit, index, word) } } : d));
  }, []);

  const setGloveColor = useCallback((slot: 0 | 1, word: number) => {
    setDraft((d) => (d ? { ...d, sheet: { ...d.sheet, override: withGloveColor(d.sheet, slot, word) } } : d));
  }, []);

  const resetColor = useCallback((outfit: OutfitId, index: number) => {
    setDraft((d) => (d ? { ...d, sheet: { ...d.sheet, override: withColor(d.sheet, outfit, index, d.sheet.original.outfits[outfit][index]) } } : d));
  }, []);

  const revert = useCallback(() => {
    setDraft((d) => (d ? { ...d, sheet: { ...d.sheet, override: {} } } : d));
  }, []);

  const save = useCallback(async (as?: string) => {
    if (!draft) return null;
    const name = safeFileName(as ?? draft.file ?? `${draft.sheet.meta.name || 'sprite'}.rsp`);
    await saveSheet(name, draft.sheet);
    // The core only speaks ZSPR, so a live push always flattens regardless of container.
    setApplied(applyPlayerSprite(toZsprBytes(draft.sheet)));
    setDraft({ file: name, sheet: draft.sheet });
    return name;
  }, [draft]);

  const dirty = useMemo(() => !!draft && !isEmptyOverride(draft.sheet.override), [draft]);

  return { draft, dirty, applied, open, createNew, close, patch, setColor, setGloveColor, resetColor, revert, save };
};

export { useSpriteDraft };
export type { OpenDraft };
