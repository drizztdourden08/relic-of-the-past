/* @layer renderer-components @kind hook */
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { SelectOption } from '../../../../../../design-system/primitives/Select';
import { formatBytes } from '../../../../../../../utils/formatBytes';
import { MSU_TRACK_DESCRIPTIONS } from './msu-track-descriptions';
import { getTrackNumber } from './types';
import type { MsuPack, MsuFile, TrackInfo, MatchedTrack } from './types';

const useMsuManager = (onRefresh: () => void) => {
  const [packs, setPacks] = useState<MsuPack[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [files, setFiles] = useState<MsuFile[]>([]);
  const [trackInfos, setTrackInfos] = useState<TrackInfo[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [newPackName, setNewPackName] = useState('');
  const [trackMapping, setTrackMapping] = useState<Record<number, string>>({});

  const refresh = useCallback(async () => {
    const list = await window.api.listMsuPacks();
    setPacks(list);
    onRefresh();
  }, [onRefresh]);

  useEffect(() => { refresh(); }, [refresh]);

  // Load pack files + track info when selection changes
  useEffect(() => {
    if (!selected) { setFiles([]); setTrackInfos([]); return; }
    setLoadingFiles(true);
    Promise.all([
      window.api.getMsuPackFiles(selected),
      window.api.getMsuTrackList(selected),
    ]).then(([fileList, tracks]) => {
      setFiles(fileList.sort((a, b) => {
        const na = getTrackNumber(a.name) ?? 999;
        const nb = getTrackNumber(b.name) ?? 999;
        return na - nb;
      }));
      setTrackInfos(tracks.sort((a, b) => a.trackNum - b.trackNum));
      setLoadingFiles(false);
    });
  }, [selected]);

  // Build default mapping: trackNum → fileName
  useEffect(() => {
    const mapping: Record<number, string> = {};
    for (const t of trackInfos) {
      mapping[t.trackNum] = t.fileName;
    }
    setTrackMapping(mapping);
  }, [trackInfos]);

  const fileOptions: SelectOption[] = useMemo(() => [
    { value: '', label: '(none)' },
    ...trackInfos.map((t) => ({
      value: t.fileName,
      label: `#${t.trackNum} — ${t.fileName}`,
      description: formatBytes(files.find((f) => f.name === t.fileName)?.size ?? 0),
    })),
  ], [trackInfos, files]);

  const isDeluxe = useMemo(() => trackInfos.some((t) => t.trackNum >= 37), [trackInfos]);
  const hasOpuz = useMemo(() => trackInfos.some((t) => t.ext === 'opuz'), [trackInfos]);

  const { matchedTracks, unmatchedFiles } = useMemo(() => {
    const assignedFiles = new Set(Object.values(trackMapping).filter(Boolean));
    const matched: MatchedTrack[] = [];

    const allTrackNums = Object.keys(MSU_TRACK_DESCRIPTIONS).map(Number).sort((a, b) => a - b);
    for (const num of allTrackNums) {
      const fileName = trackMapping[num] ?? null;
      if (fileName || trackInfos.some((t) => t.trackNum === num)) {
        matched.push({
          trackNum: num,
          description: MSU_TRACK_DESCRIPTIONS[num] ?? `Track ${num}`,
          fileName,
        });
      }
    }

    for (const t of trackInfos) {
      if (!MSU_TRACK_DESCRIPTIONS[t.trackNum] && !matched.some((m) => m.trackNum === t.trackNum)) {
        matched.push({
          trackNum: t.trackNum,
          description: `Track ${t.trackNum}`,
          fileName: trackMapping[t.trackNum] ?? t.fileName,
        });
      }
    }
    matched.sort((a, b) => a.trackNum - b.trackNum);

    const unmatched = trackInfos.filter((t) => !assignedFiles.has(t.fileName));
    return { matchedTracks: matched, unmatchedFiles: unmatched };
  }, [trackMapping, trackInfos]);

  const handleTrackAssign = useCallback((trackNum: number, fileName: string) => {
    setTrackMapping((prev) => ({ ...prev, [trackNum]: fileName }));
  }, []);

  const handleUrlImport = useCallback(async (url: string) => {
    const packName = newPackName.trim() || `pack-${Date.now()}`;
    const result = await window.api.importMsu(packName, url);
    if (result.success) {
      await refresh();
      setSelected(packName);
      setNewPackName('');
      return { success: true, message: `Imported ${result.fileCount ?? 0} MSU files` };
    }
    return { success: false, message: result.error ?? 'Download failed' };
  }, [newPackName, refresh]);

  const handleFileImport = useCallback(async (importFiles: File[]) => {
    if (importFiles.length === 0) return { success: false, message: 'No file selected' };
    const filePath = window.api.getFilePath(importFiles[0]);
    if (!filePath) return { success: false, message: 'Could not read file path' };
    const packName = newPackName.trim() || `pack-${Date.now()}`;
    const result = await window.api.importMsuFile(packName, filePath);
    if (result.success) {
      await refresh();
      setSelected(packName);
      setNewPackName('');
      return { success: true, message: `Imported ${result.fileCount ?? 0} MSU files` };
    }
    return { success: false, message: result.error ?? 'Import failed' };
  }, [newPackName, refresh]);

  return {
    packs,
    selected,
    setSelected,
    files,
    trackInfos,
    loadingFiles,
    newPackName,
    setNewPackName,
    fileOptions,
    isDeluxe,
    hasOpuz,
    matchedTracks,
    unmatchedFiles,
    handleTrackAssign,
    handleUrlImport,
    handleFileImport,
    refresh,
  };
};

export { useMsuManager };
