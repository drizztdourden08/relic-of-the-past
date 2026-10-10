/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MsuFileMetadata } from '@rotp/msu';
import { withFileRenamed } from '@rotp/msu';
import * as msuStore from '@app/storage/msu-store';
import { extensionOf, sanitizeFileName } from './track-file-name';
import { failure } from './failure';
import { useSoundUpload } from './useSoundUpload';
import type { ActionResult } from '../msu.type';
import type { FilePanelParams, FormatCount } from './file-panel.type';

const formatCounts = (metadata: MsuFileMetadata[]): FormatCount[] => {
  const counts = new Map<string, number>();
  for (const file of metadata) counts.set(file.ext, (counts.get(file.ext) ?? 0) + 1);
  return [...counts]
    .map(([ext, count]) => ({ ext, count }))
    .sort((a, b) => b.count - a.count || a.ext.localeCompare(b.ext));
};

const renameProblem = (from: string, to: string, taken: Set<string>): string | null => {
  if (to.length === 0) return 'Give the file a name.';
  if (to !== sanitizeFileName(to)) return 'That name has characters a file name cannot hold.';
  if (extensionOf(to) !== extensionOf(from)) return 'Keep the extension, because it says how the audio is encoded.';
  if (taken.has(to)) return `The pack already has a file called "${to}".`;
  return null;
};

const useFilePanel = (params: FilePanelParams) => {
  const { pack, files, saveBase, reload } = params;
  const [metadata, setMetadata] = useState<MsuFileMetadata[]>([]);
  const [settledPack, setSettledPack] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [working, setWorking] = useState(false);
  const [status, setStatus] = useState<ActionResult | null>(null);
  const { upload, uploading } = useSoundUpload({ pack, files, reload });

  useEffect(() => {
    if (files.length === 0) { setMetadata([]); setSettledPack(pack); return undefined; }
    let live = true;
    void msuStore.getMsuFileMetadata(pack)
      .then((list) => { if (live) { setMetadata(list); setSettledPack(pack); } })
      .catch(() => { if (live) { setMetadata([]); setSettledPack(pack); } });
    return () => { live = false; };
  }, [pack, files]);

  const rows = useMemo(() => {
    const needle = filter.trim().toLowerCase().replace(/^\./, '');
    if (needle.length === 0) return metadata;
    return metadata.filter((file) => file.name.toLowerCase().includes(needle) || file.ext === needle);
  }, [metadata, filter]);

  const totalSize = useMemo(() => metadata.reduce((sum, file) => sum + file.size, 0), [metadata]);
  const formats = useMemo(() => formatCounts(metadata), [metadata]);
  const taken = useMemo(() => new Set(metadata.map((file) => file.name)), [metadata]);

  const renameFile = useCallback((from: string, to: string) => {
    const wanted = to.trim();
    if (wanted === from) return;
    const problem = renameProblem(from, wanted, taken);
    if (problem !== null) { setStatus({ success: false, message: problem }); return; }
    setWorking(true);
    void (async () => {
      try {
        await msuStore.renameMsuTrackFile(pack, from, wanted);
        if (saveBase !== null) await msuStore.writeMsuManifest(pack, withFileRenamed(saveBase, from, wanted));
        setStatus({ success: true, message: `Renamed to "${wanted}"` });
      } catch (err) {
        setStatus(failure(err, 'Could not rename that file'));
      } finally {
        setWorking(false);
        reload();
      }
    })();
  }, [pack, saveBase, taken, reload]);

  const deleteFile = useCallback((fileName: string) => {
    setWorking(true);
    void (async () => {
      try {
        await msuStore.deleteMsuTrackFile(pack, fileName);
        setStatus({ success: true, message: `Deleted "${fileName}"` });
      } catch (err) {
        setStatus(failure(err, 'Could not delete that file'));
      } finally {
        setWorking(false);
        reload();
      }
    })();
  }, [pack, reload]);

  const handleUpload = useCallback((dropped: File[]) => {
    void upload(dropped).then(setStatus);
  }, [upload]);

  const report = useCallback((result: ActionResult) => { setStatus(result); }, []);

  return {
    metadata, rows, totalSize, formats,
    ready: settledPack === pack,
    filter, setFilter,
    renameFile, deleteFile, handleUpload, report,
    busy: working || uploading,
    statusMessage: status?.message ?? null,
    statusOk: status?.success !== false,
  };
};

export { useFilePanel };
export type { FilePanelParams, FormatCount } from './file-panel.type';
