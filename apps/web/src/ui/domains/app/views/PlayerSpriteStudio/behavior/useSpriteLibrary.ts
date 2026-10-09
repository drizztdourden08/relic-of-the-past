/* @layer renderer-hooks @kind logic */
import { useState, useEffect, useCallback } from 'react';
import { listLinkSprites, importLinkSprite } from '@app/lib/storage/link-sprites-store';
import { spriteStem } from '@shared/storage/link-sprites/link-sprites';
import { deleteSprite } from '@app/lib/game/player-sheet/delete-sprite';
import { loadSheet } from '@app/lib/game/player-sheet/load-sheet';
import { renderThumbnail } from '@app/lib/game/player-sheet/thumbnail';
import { isRspName } from '@shared/storage/link-sprites/parse-rsp';
import type { LibraryEntry } from '../PlayerSpriteStudio.type';

const useSpriteLibrary = () => {
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const names = await listLinkSprites();
    const loaded = await Promise.all(names.map(async (name) => {
      const sheet = await loadSheet(name);
      return {
        name,
        label: spriteStem(name),
        container: isRspName(name) ? 'rsp' as const : 'zspr' as const,
        preview: sheet ? renderThumbnail(sheet) : null,
      };
    }));
    setEntries(loaded);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

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

  return { entries, loading, refresh, importFiles, importBytes, remove };
};

export { useSpriteLibrary };
export type { LibraryEntry };
