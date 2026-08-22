/* @layer renderer-components @kind hook */
/**
 * State and handlers for RomManager: which import lane is active, the supplement
 * list (fetched separately from the base `romStatuses` prop, since supplements
 * carry no extraction status of their own), detail-panel loading, and kind-aware
 * import handlers.
 *
 * A supplement only reaches the game through a rebuild of the base blob that
 * carries it, so a successful supplement import re-triggers `onExtractAssets`
 * for every base cartridge that already has assets built — the same call the
 * base lane uses for itself, just fanned out.
 */
import { useState, useEffect, useCallback } from 'react';
import type { RomKind } from '@shared/storage/rom-kinds';
import { ROM_KINDS } from '@shared/storage/rom-kinds';
import type { SupplementStatus } from '@shared/storage/roms';
import * as romsStore from '@app/lib/storage/roms-store';
import type { RomDetail } from './types';

interface UseRomManagerParams {
  romStatuses: RomDisplayInfo[];
  onRefresh: () => void;
  onExtractAssets: (romFile: string) => void;
}

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

  // A supplement's `attachedTo` only becomes true once the rebuild that
  // `romStatuses` reports on finishes, so re-list whenever that prop changes.
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
    if (files.length === 0) return { success: false, message: 'No file selected' };
    const result = await romsStore.importFile(files[0], activeKind);
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
export type { UseRomManagerParams };
