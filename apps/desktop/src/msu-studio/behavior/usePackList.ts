/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useState } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import * as msuStore from '@app/storage/msu-store';
import { failure } from './failure';
import type { ActionResult, MsuPackRow } from '../msu.type';

const usePackList = (onRefresh: () => void) => {
  const t = useT();
  const [packs, setPacks] = useState<MsuPackRow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loadingPacks, setLoadingPacks] = useState(true);

  const refresh = useCallback(async () => {
    const list = await msuStore.listMsuPacks();
    const rows = await Promise.all(list.map(async (pack): Promise<MsuPackRow> => {
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

  useEffect(() => {
    void refresh().catch(() => undefined).finally(() => { setLoadingPacks(false); });
  }, [refresh]);

  const renamePack = useCallback(async (from: string, to: string): Promise<ActionResult> => {
    const trimmed = to.trim();
    if (!trimmed) return { success: false, message: t('msu-studio:pack.rename.empty') };
    if (trimmed === from) return { success: true, message: t('msu-studio:pack.rename.unchanged') };
    try {
      await msuStore.renameMsuPack(from, trimmed);
      await refresh();
      setSelected(trimmed);
      return { success: true, message: t('msu-studio:status.renamed', { name: trimmed }) };
    } catch (err) { return failure(err, t('msu-studio:pack.rename.error')); }
  }, [t, refresh]);

  return { packs, loadingPacks, selected, setSelected, refresh, renamePack };
};

export { usePackList };
