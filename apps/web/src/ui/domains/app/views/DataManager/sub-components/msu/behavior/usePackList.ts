/* @layer renderer-components @kind hook */
// The pack list, selection, and whole-pack operations. Manifests are read here so rows need not ask storage.
import { useCallback, useEffect, useState } from 'react';
import * as msuStore from '@app/lib/storage/msu-store';
import type { ActionResult, MsuPackRow } from '../msu.type';

const failure = (err: unknown, fallback: string): ActionResult => ({
  success: false, message: err instanceof Error ? err.message : fallback,
});

const usePackList = (onRefresh: () => void) => {
  const [packs, setPacks] = useState<MsuPackRow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const list = await msuStore.listMsuPacks();
    const rows = await Promise.all(list.map(async (pack): Promise<MsuPackRow> => {
      // listMsuPacks counts only the two MSU extensions, so a layered pack full of wav/flac
      // would report nothing. The audio listing is the one that sees every playable file.
      const audio = await msuStore.listMsuAudioFiles(pack.name);
      return {
        name: pack.name,
        fileCount: audio.length,
        totalSize: audio.reduce((sum, f) => sum + f.size, 0),
        format: (await msuStore.readMsuManifest(pack.name)) ? 'layered' : 'classic',
      };
    }));
    setPacks(rows);
    onRefresh();
  }, [onRefresh]);

  useEffect(() => { refresh(); }, [refresh]);

  const createPack = useCallback(async (name: string): Promise<ActionResult> => {
    const trimmed = name.trim();
    if (!trimmed) return { success: false, message: 'Give the pack a name first.' };
    try {
      await msuStore.createMsuPack(trimmed);
      await refresh();
      setSelected(trimmed);
      return { success: true, message: `Created empty pack "${trimmed}"` };
    } catch (err) { return failure(err, 'Could not create the pack'); }
  }, [refresh]);

  const renamePack = useCallback(async (from: string, to: string): Promise<ActionResult> => {
    const trimmed = to.trim();
    if (!trimmed) return { success: false, message: 'Give the pack a name first.' };
    if (trimmed === from) return { success: true, message: 'Name unchanged' };
    try {
      await msuStore.renameMsuPack(from, trimmed);
      await refresh();
      setSelected(trimmed);
      return { success: true, message: `Renamed to "${trimmed}"` };
    } catch (err) { return failure(err, 'Could not rename the pack'); }
  }, [refresh]);

  return { packs, selected, setSelected, refresh, createPack, renamePack };
};

export { usePackList, failure };
