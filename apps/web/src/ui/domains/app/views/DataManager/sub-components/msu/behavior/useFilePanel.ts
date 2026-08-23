/* @layer renderer-components @kind hook */
/**
 * The files tab, wired: what each file in the pack is, the filter over them, and the edits that
 * change the pack's contents.
 *
 * The metadata is a second read rather than something derived from the file listing, because the
 * listing carries only names and sizes. Format, length, rate and channels come from
 * `packFileMetadata`, which is arithmetic on the same directory entries and opens no file — so a
 * pack of a hundred files costs one listing, not a hundred reads.
 *
 * A repeat point is NOT read here. It is the one thing that needs the file itself — the format
 * holds it in a header, but a header is only reachable by reading the bytes — so collecting them
 * for the whole list would pull a multi-gigabyte pack through memory to look at eight bytes each.
 * Auditioning a file pays that cost anyway, so the decode reports it and `useFileAudition` keeps
 * it.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import type { MsuFileMetadata } from '@shared/storage/msu';
import { withFileRenamed } from '@shared/storage/msu-layer-edit';
import * as msuStore from '@app/lib/storage/msu-store';
import { extensionOf, sanitizeFileName } from './track-file-name';
import { failure } from './usePackList';
import { useSoundUpload } from './useSoundUpload';
import type { ActionResult, MsuFile } from '../msu.type';

interface FilePanelParams {
  pack: string;
  files: MsuFile[];
  /** What a rename WRITES into. Null for a classic pack, which must stay classic. */
  saveBase: MsuPackManifest | null;
  reload: () => void;
}

/** How many files the pack holds of each format, the biggest group first. */
interface FormatCount {
  ext: string;
  count: number;
}

const formatCounts = (metadata: MsuFileMetadata[]): FormatCount[] => {
  const counts = new Map<string, number>();
  for (const file of metadata) counts.set(file.ext, (counts.get(file.ext) ?? 0) + 1);
  return [...counts]
    .map(([ext, count]) => ({ ext, count }))
    .sort((a, b) => b.count - a.count || a.ext.localeCompare(b.ext));
};

/**
 * Why this new name cannot be used, or null when it can. The extension is held fixed: it is what
 * says how the audio is encoded, and in a pack without a manifest the name is also the wiring, so
 * a rename is allowed to retitle a file and nothing else.
 */
const renameProblem = (from: string, to: string, taken: Set<string>): string | null => {
  if (to.length === 0) return 'Give the file a name.';
  if (to !== sanitizeFileName(to)) return 'That name has characters a file name cannot hold.';
  if (extensionOf(to) !== extensionOf(from)) return 'Keep the extension — it says how the audio is encoded.';
  if (taken.has(to)) return `The pack already has a file called "${to}".`;
  return null;
};

const useFilePanel = (params: FilePanelParams) => {
  const { pack, files, saveBase, reload } = params;
  const [metadata, setMetadata] = useState<MsuFileMetadata[]>([]);
  // Which pack the metadata has settled FOR. Until the first read of the current pack lands, the
  // list has nothing truthful to say — so the panel shows nothing rather than a false empty state.
  const [settledPack, setSettledPack] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [working, setWorking] = useState(false);
  const [status, setStatus] = useState<ActionResult | null>(null);
  const { upload, uploading } = useSoundUpload({ pack, files, reload });

  // `files` is re-fetched by the pack's own reload, so its identity changing is the signal that
  // what is on disk has moved on. The previous metadata stays up while the re-read is in flight,
  // so a reload swaps rows in place instead of blanking the list.
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
        // Storage moves the bytes only, so a pack with a manifest has to be re-pointed in the same
        // breath or every layer built on this file stops finding it.
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

  // Lets an action owned by the panel above — a bulk removal, say — land in the same status
  // line as the ones owned here, rather than growing a second place the user has to look.
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
export type { FilePanelParams, FormatCount };
