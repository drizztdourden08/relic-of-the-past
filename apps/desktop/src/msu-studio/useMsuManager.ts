/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import { usePackList } from './behavior/usePackList';
import { usePackContents } from './behavior/usePackContents';
import { useTrackRows } from './behavior/useTrackRows';
import { useTrackAssign } from './behavior/useTrackAssign';
import { useTrackUpload } from './behavior/useTrackUpload';
import { useTrackPreview } from './behavior/useTrackPreview';
import { usePackExport } from './behavior/usePackExport';
import { useFileDeletion } from './behavior/useFileDeletion';
import { usePackImports } from './behavior/usePackImports';
import { managerStatus } from './behavior/manager-status';
import type { ActionResult, PackFormat } from './msu.type';

const useMsuManager = (onRefresh: () => void) => {
  const { packs, loadingPacks, selected, setSelected, refresh, createPack, renamePack } = usePackList(onRefresh);
  const { files, trackInfos, manifest, resolved, totalSize, loaded, reload } = usePackContents(selected);
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
  const { handleUrlImport, handleFileImport } = usePackImports({ newPackName, setNewPackName, refresh, setSelected });

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

  const handleDeleteFile = useFileDeletion(selected, reload, report);

  const handleToggleLayers = useCallback((trackNum: number) => {
    setOpenTrack((open) => (open === trackNum ? null : trackNum));
  }, []);

  return {
    packs, loadingPacks, selected, setSelected, refresh,
    files, trackInfos, manifest, resolved, totalSize, loadingFiles: !loaded, reload, format,
    newPackName, setNewPackName,
    rows, unusedFiles, fileOptions, isDeluxe, hasOpuz,
    status, ...managerStatus({ previewError, exportProgress, status }),
    busy: assigning || uploading || exporting !== null,
    openTrack, playing, reportStore,
    handleTrackAssign, handleTrackUpload, handleToggleLayers, handleExport, handleDeleteFile,
    handleCreatePack, handleRenamePack, handleUrlImport, handleFileImport,
    onPreview: play, onStopPreview: stop,
    exporting,
  };
};

export { useMsuManager };
