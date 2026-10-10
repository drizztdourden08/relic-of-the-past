/* @layer renderer-hooks @kind logic */
import { useState, useCallback, useMemo } from 'react';
import type { OutfitId, PlayerSheet, SheetPalette } from '@rotp/game-data';
import { loadSheet, saveSheet } from '@app/game/player-sheet/load-sheet';
import { withColor, withGloveColor, isEmptyOverride, toZsprBytes, safeFileName } from '@rotp/packs';
import { loadStockSheet } from '@app/game/stock-player-sheet';
import { applyPlayerSprite } from '@app/game/player-sprite';
import type { OpenDraft } from '../PlayerSpriteStudio.type';
import { isLiveSelection } from './is-live-selection';
import { colorAt } from './color-at';

const useSpriteDraft = (romFile: string | null, stockPalette?: SheetPalette) => {
  const [draft, setDraft] = useState<OpenDraft | null>(null);
  const [applied, setApplied] = useState<boolean | null>(null);

  const open = useCallback(async (name: string) => {
    const sheet = await loadSheet(name, stockPalette);
    if (sheet) { setDraft({ file: name, sheet }); setApplied(null); }
    return Boolean(sheet);
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
    setDraft((d) => (d ? { ...d, sheet: { ...d.sheet, override: withColor(d.sheet, outfit, index, colorAt(d.sheet.original.outfits[outfit], index)) } } : d));
  }, []);

  const revert = useCallback(() => {
    setDraft((d) => (d ? { ...d, sheet: { ...d.sheet, override: {} } } : d));
  }, []);

  const save = useCallback(async (as?: string) => {
    if (!draft) return null;
    const name = safeFileName(as ?? draft.file ?? `${draft.sheet.meta.name || 'sprite'}.rsp`);
    await saveSheet(name, draft.sheet);
    const live = await isLiveSelection(name) && applyPlayerSprite(toZsprBytes(draft.sheet));
    setApplied(live);
    setDraft({ file: name, sheet: draft.sheet });
    return name;
  }, [draft]);

  const dirty = useMemo(() => draft !== null && !isEmptyOverride(draft.sheet.override), [draft]);

  return { draft, dirty, applied, open, createNew, close, patch, setColor, setGloveColor, resetColor, revert, save };
};

export { useSpriteDraft };
export type { OpenDraft };
