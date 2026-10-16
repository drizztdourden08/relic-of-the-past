/* @layer renderer-hooks @kind logic */
import { useState, useEffect, useCallback } from 'react';
import { listLinkSprites, importLinkSprite } from '@app/storage/link-sprites-store';
import { spriteStem, renderThumbnail, isRspName } from '@rotp/packs';
import { deleteSprite } from '@app/game/player-sheet/delete-sprite';
import { loadSheet } from '@app/game/player-sheet/load-sheet';
import { loadStockSheet } from '@app/game/stock-player-sheet';
import { useSpriteAvailabilityStore } from '@app/stores/sprite-availability-store';
import type { LibraryEntry } from '../PlayerSpriteStudio.type';

const useSpriteLibrary = () => {
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [stockPreview, setStockPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const romFile = useSpriteAvailabilityStore((s) => s.romFile);

  const refresh = useCallback(async () => {
    setLoading(true);
    const stock = romFile ? await loadStockSheet(romFile) : null;
    setStockPreview(stock ? renderThumbnail(stock) : null);
    const names = await listLinkSprites();
    const loaded = await Promise.all(names.map(async (name) => {
      const sheet = await loadSheet(name, stock?.original);
      return {
        name,
        label: spriteStem(name),
        container: isRspName(name) ? 'rsp' as const : 'zspr' as const,
        preview: sheet ? renderThumbnail(sheet) : null,
      };
    }));
    setEntries(loaded);
    setLoading(false);
  }, [romFile]);

  useEffect(() => { void refresh(); }, [refresh]);

  const importFiles = useCallback(async (fileList: File[]) => {
    let last = '';
    for (const file of fileList) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const result = await importLinkSprite(file.name, bytes);
      if (!result.success) return { success: false, message: result.error ?? 'Import failed' };
      last = spriteStem(result.name ?? file.name);
    }
    await refresh();
    return { success: true, message: `Imported ${last}` };
  }, [refresh]);

  const importBytes = useCallback(async (name: string, bytes: Uint8Array) => {
    const result = await importLinkSprite(name, bytes);
    if (!result.success) return { success: false, message: result.error ?? 'Import failed' };
    await refresh();
    return { success: true, message: `Imported ${spriteStem(result.name ?? name)}` };
  }, [refresh]);

  const remove = useCallback(async (name: string) => {
    await deleteSprite(name);
    await refresh();
  }, [refresh]);

  return { entries, stockPreview, loading, refresh, importFiles, importBytes, remove };
};

export { useSpriteLibrary };
