/* @layer renderer-components @kind hook */
// Composes the hooks in ./behavior into one flat surface. Every action's outcome lands in one status line.
import { useCallback, useMemo, useState } from 'react';
import * as msuStore from '@app/lib/storage/msu-store';
import { usePackList } from './behavior/usePackList';
import { usePackContents } from './behavior/usePackContents';
import { useTrackRows } from './behavior/useTrackRows';
import { useTrackAssign } from './behavior/useTrackAssign';
import { useTrackUpload } from './behavior/useTrackUpload';
import { useTrackPreview } from './behavior/useTrackPreview';
import { usePackExport } from './behavior/usePackExport';
import { usePackImport, isMsulName } from './behavior/usePackImport';
import type { ActionResult, PackFormat } from './msu.type';

// Both kinds of skip are normal for a pack that ships extras, but silence reads as "everything came in".
const skipNote = (result: { skippedNested?: number; skippedDuplicate?: number }): string => {
  const parts: string[] = [];
  if (result.skippedNested) parts.push(`${result.skippedNested} in subfolders (alternates and extras)`);
  if (result.skippedDuplicate) parts.push(`${result.skippedDuplicate} already claimed by another file`);
  return parts.length === 0 ? '' : ` (skipped ${parts.join(', ')})`;
};

const useMsuManager = (onRefresh: () => void) => {
  const { packs, selected, setSelected, refresh, createPack, renamePack } = usePackList(onRefresh);
  const { files, trackInfos, manifest, resolved, totalSize, loading, loaded, reload } = usePackContents(selected);
  const format: PackFormat = manifest ? 'layered' : 'classic';

  const [newPackName, setNewPackName] = useState('');
  const [status, setStatus] = useState<ActionResult | null>(null);
  const [openTrack, setOpenTrack] = useState<number | null>(null);

  const { rows, unusedFiles, fileOptions, isDeluxe, hasOpuz } = useTrackRows(resolved, files);
  const shared = { pack: selected, format, manifest: resolved, files, reload };
  const { assign, assigning } = useTrackAssign(shared);
  const { upload, uploading } = useTrackUpload(shared);
  const { playing, previewError, play, stop, reportStore } = useTrackPreview(selected, resolved);
  const { exporting, exportProgress, runExport } = usePackExport(selected, resolved);

  const { importMsul } = usePackImport({ refresh, onImported: setSelected });

  const report = useCallback(async (action: Promise<ActionResult>): Promise<ActionResult> => {
    const result = await action;
    setStatus(result);
    return result;
  }, []);

  const handleTrackAssign = useCallback((trackNum: number, fileName: string) => {
    void report(assign(trackNum, fileName));
  }, [assign, report]);

  const handleTrackUpload = useCallback((trackNum: number, dropped: File[]) => {
    void report(upload(trackNum, dropped));
  }, [upload, report]);

  const handleExport = useCallback((target: 'msul' | 'msu1') => {
    void report(runExport(target));
  }, [runExport, report]);

  const handleCreatePack = useCallback(async () => {
    const result = await report(createPack(newPackName));
    if (result.success) setNewPackName('');
  }, [createPack, newPackName, report]);

  const handleRenamePack = useCallback((to: string) => {
    if (selected) void report(renamePack(selected, to));
  }, [selected, renamePack, report]);

  const deleteFile = useCallback(async (fileName: string): Promise<ActionResult> => {
    if (!selected) return { success: false, message: 'No pack selected' };
    try {
      await msuStore.deleteMsuTrackFile(selected, fileName);
      return { success: true, message: `Deleted "${fileName}"` };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : 'Could not delete that file' };
    } finally {
      reload();
    }
  }, [selected, reload]);

  const handleDeleteFile = useCallback((fileName: string) => {
    void report(deleteFile(fileName));
  }, [deleteFile, report]);

  const handleToggleLayers = useCallback((trackNum: number) => {
    setOpenTrack((open) => (open === trackNum ? null : trackNum));
  }, []);

  const handleUrlImport = useCallback(async (url: string): Promise<ActionResult> => {
    const pack = newPackName.trim() || `pack-${Date.now()}`;
    const result = await msuStore.importMsu(pack, url);
    if (!result.success) return { success: false, message: result.error ?? 'Download failed' };
    await refresh();
    setSelected(pack);
    setNewPackName('');
    return { success: true, message: `Imported ${result.fileCount ?? 0} audio files${skipNote(result)}` };
  }, [newPackName, refresh, setSelected]);

  const handleFileImport = useCallback(async (dropped: File[]): Promise<ActionResult> => {
    if (dropped.length === 0) return { success: false, message: 'No file selected' };
    // A .msul carries its own manifest, so it becomes a layered pack, not a raw copy.
    if (isMsulName(dropped[0].name)) {
      const result = await importMsul(dropped[0], newPackName.trim());
      if (result.success) setNewPackName('');
      return result;
    }
    const pack = newPackName.trim() || `pack-${Date.now()}`;
    const result = await msuStore.importMsuFile(pack, dropped[0]);
    if (!result.success) return { success: false, message: result.error ?? 'Import failed' };
    await refresh();
    setSelected(pack);
    setNewPackName('');
    return { success: true, message: `Imported ${result.fileCount ?? 0} audio files${skipNote(result)}` };
  }, [newPackName, refresh, setSelected, importMsul]);

  return {
    packs, selected, setSelected, refresh,
    // True only while a pack's FIRST read is in flight. A reload keeps the studio mounted with
    // its current rows, so an edit never blanks the pane and throws the scroll position away.
    files, trackInfos, manifest, resolved, totalSize, loadingFiles: loading && !loaded, reload, format,
    newPackName, setNewPackName,
    rows, unusedFiles, fileOptions, isDeluxe, hasOpuz,
    status, statusMessage: previewError ?? exportProgress ?? status?.message ?? null,
    statusOk: previewError ? false : status?.success !== false,
    busy: assigning || uploading || exporting !== null,
    openTrack, playing, reportStore,
    handleTrackAssign, handleTrackUpload, handleToggleLayers, handleExport, handleDeleteFile,
    handleCreatePack, handleRenamePack, handleUrlImport, handleFileImport,
    onPreview: play, onStopPreview: stop,
    exporting,
  };
};

export { useMsuManager };
