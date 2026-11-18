/* @layer renderer-components @kind hook */
import { useT } from '@drizztdourden08/brock-react';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { useState, useEffect, useCallback } from 'react';
import type { RomKind, SupplementStatus } from '@rotp/roms';
import { ROM_KINDS } from '@rotp/roms';
import * as romsStore from '@app/storage/roms-store';
import type { RomDetail } from './rom-detail.type';
import type { RomImportOutcome, UseRomManagerParams } from './rom-manager.type';

const importMessage = (kind: RomKind, romFile: string, alreadyExists: boolean, t: I18n['t']): string =>
  alreadyExists ? t('data-manager:rom-manager.already-imported', { kind: ROM_KINDS[kind].label }) : t('data-manager:rom-manager.imported', { name: romFile });

const useRomManager = (params: UseRomManagerParams) => {
  const { romStatuses, onRefresh, onExtractAssets } = params;
  const t = useT();
  const [activeKind, setActiveKind] = useState<RomKind>('snes-alttp');
  const [supplements, setSupplements] = useState<SupplementStatus[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<RomDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const refreshSupplements = useCallback(() => {
    void romsStore.listSupplements().then(setSupplements);
  }, []);

  useEffect(() => { refreshSupplements(); }, [romStatuses, refreshSupplements]);

  useEffect(() => {
    if (!selected) { setDetail(null); return; }
    setLoadingDetail(true);
    void romsStore.getRomInfo(selected).then((info) => {
      setDetail(info);
      setLoadingDetail(false);
    });
  }, [selected]);

  const triggerRebuild = useCallback((kind: RomKind, romFile: string) => {
    if (kind === 'snes-alttp') {
      void onExtractAssets(romFile);
      return;
    }
    romStatuses.filter((base) => base.hasAssets).forEach((base) => { void onExtractAssets(base.romFile); });
  }, [romStatuses, onExtractAssets]);

  const settleImport = useCallback((result: Awaited<ReturnType<typeof romsStore.importUrl>>, failure: string): RomImportOutcome => {
    if (!result.success) return { success: false, message: result.error ?? failure };
    onRefresh();
    if (!result.alreadyExists) triggerRebuild(activeKind, result.romFile);
    return { success: true, id: result.romFile, message: importMessage(activeKind, result.romFile, Boolean(result.alreadyExists), t) };
  }, [activeKind, onRefresh, triggerRebuild, t]);

  const handleUrlImport = useCallback(async (url: string) =>
    settleImport(await romsStore.importUrl(url, activeKind), t('data-manager:rom-manager.download-failed')), [activeKind, settleImport, t]);

  const handleFileImport = useCallback(async (files: File[]): Promise<RomImportOutcome> => {
    const [file] = files;
    if (file === undefined) return { success: false, message: t('data-manager:rom-manager.no-file') };
    return settleImport(await romsStore.importFile(file, activeKind), t('data-manager:rom-manager.import-failed'));
  }, [activeKind, settleImport, t]);

  return {
    activeKind, setActiveKind,
    supplements,
    selected, setSelected,
    detail, loadingDetail,
    handleUrlImport, handleFileImport,
  };
};

export { useRomManager };
