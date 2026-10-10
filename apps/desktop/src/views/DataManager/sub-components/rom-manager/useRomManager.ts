/* @layer renderer-components @kind hook */
import { useState, useEffect, useCallback } from 'react';
import type { RomKind, SupplementStatus } from '@rotp/roms';
import { ROM_KINDS } from '@rotp/roms';
import * as romsStore from '@app/storage/roms-store';
import type { RomDetail } from './rom-detail.type';
import type { UseRomManagerParams } from './useRomManager.type';

const importMessage = (kind: RomKind, romFile: string, alreadyExists: boolean): string =>
  alreadyExists ? `${ROM_KINDS[kind].label} already imported` : `Imported ${romFile}`;

const useRomManager = (params: UseRomManagerParams) => {
  const { romStatuses, onRefresh, onExtractAssets } = params;
  const [activeKind, setActiveKind] = useState<RomKind>('snes-alttp');
  const [supplements, setSupplements] = useState<SupplementStatus[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<RomDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const refreshSupplements = useCallback(() => {
    romsStore.listSupplements().then(setSupplements);
  }, []);

  useEffect(() => { refreshSupplements(); }, [romStatuses, refreshSupplements]);

  useEffect(() => {
    if (!selected) { setDetail(null); return; }
    setLoadingDetail(true);
    romsStore.getRomInfo(selected).then((info) => {
      setDetail(info);
      setLoadingDetail(false);
    });
  }, [selected]);

  const triggerRebuild = useCallback((kind: RomKind, romFile: string) => {
    if (kind === 'snes-alttp') {
      onExtractAssets(romFile);
      return;
    }
    romStatuses.filter((base) => base.hasAssets).forEach((base) => onExtractAssets(base.romFile));
  }, [romStatuses, onExtractAssets]);

  const handleUrlImport = useCallback(async (url: string) => {
    const result = await romsStore.importUrl(url, activeKind);
    if (result.success) {
      onRefresh();
      if (!result.alreadyExists) triggerRebuild(activeKind, result.romFile);
      return { success: true, message: importMessage(activeKind, result.romFile, !!result.alreadyExists) };
    }
    return { success: false, message: result.error ?? 'Download failed' };
  }, [activeKind, onRefresh, triggerRebuild]);

  const handleFileImport = useCallback(async (files: File[]) => {
    const [file] = files;
    if (file === undefined) return { success: false, message: 'No file selected' };
    const result = await romsStore.importFile(file, activeKind);
    if (result.success) {
      onRefresh();
      if (!result.alreadyExists) triggerRebuild(activeKind, result.romFile);
      return { success: true, message: importMessage(activeKind, result.romFile, !!result.alreadyExists) };
    }
    return { success: false, message: result.error ?? 'Import failed' };
  }, [activeKind, onRefresh, triggerRebuild]);

  return {
    activeKind, setActiveKind,
    supplements,
    selected, setSelected,
    detail, loadingDetail,
    handleUrlImport, handleFileImport,
  };
};

export { useRomManager };
