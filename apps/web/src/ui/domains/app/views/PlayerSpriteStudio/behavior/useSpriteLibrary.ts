/* @layer renderer-hooks @kind logic */
/**
 * The sprite library: what is on disk, and the operations that change it.
 *
 * Thumbnails are rendered once per refresh rather than per render, because decoding tiles
 * for every entry is the expensive part of showing the list. A ROM with compiled assets is
 * needed to create a sprite from scratch, so the hook reports whether one is available
 * instead of leaving the caller to work it out.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  listLinkSprites, importLinkSprite, spriteStem,
} from '@app/lib/storage/link-sprites-store';
import { deleteSprite } from '@app/lib/game/player-sheet/delete-sprite';
import { loadSheet } from '@app/lib/game/player-sheet/load-sheet';
import { renderThumbnail } from '@app/lib/game/player-sheet/thumbnail';
import { isRspName } from '@app/lib/game/rsp';

interface LibraryEntry {
  /** File name including extension — the key everything else uses. */
  name: string;
  label: string;
  container: 'zspr' | 'rsp';
  preview: string | null;
}

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

  // Deleting also puts the selection back to default on any profile that pointed at it,
  // so no profile is left naming a sprite that no longer exists.
  const remove = useCallback(async (name: string) => {
    await deleteSprite(name);
    await refresh();
  }, [refresh]);

  return { entries, loading, refresh, importFiles, importBytes, remove };
};

export { useSpriteLibrary };
export type { LibraryEntry };
