/* @layer renderer-appshell @kind hook */
import { useState, useCallback } from 'react';
import { log } from '@app/log-bus';
import * as romsStore from '@app/storage/roms-store';
import * as assetsStore from '@app/storage/assets-store';
import type { RomActionsDeps } from './useProfileManagement.type';
import { useDeleteRom } from './useDeleteRom';

const useRomActions = (deps: RomActionsDeps) => {
  const { refreshProfilesAndRoms } = deps;
  const [extractionStates, setExtractionStates] = useState<Record<string, RomExtractionStatus>>({});
  const [importingRom, setImportingRom] = useState(false);

  const handleImportRom = useCallback(async () => {
    const result = await romsStore.importPicked();
    if (!result) return;

    setImportingRom(true);
    if (!result.success) {
      log.error(`Failed to import ROM: ${result.error}`);
      setImportingRom(false);
      return;
    }

    log.app(result.alreadyExists ? `ROM already imported: ${result.romFile}` : `ROM imported: ${result.romFile}`);
    log.app(`Extracting assets for ${result.romFile}...`);
    setExtractionStates((prev) => ({ ...prev, [result.romFile]: 'extracting' }));
    await refreshProfilesAndRoms();
    setImportingRom(false);

    const extractResult = await assetsStore.extractAssets(result.romFile);
    if (!extractResult.success) {
      log.error(`Extraction failed: ${extractResult.error}`);
      setExtractionStates((prev) => ({ ...prev, [result.romFile]: 'failed' }));
    } else {
      setExtractionStates((prev) => ({ ...prev, [result.romFile]: 'ready' }));
    }

    await refreshProfilesAndRoms();
  }, [refreshProfilesAndRoms]);

  const handleExtractAssets = useCallback(async (romFile: string) => {
    log.app(`Extracting assets for ${romFile}...`);
    setExtractionStates((prev) => ({ ...prev, [romFile]: 'extracting' }));
    const result = await assetsStore.extractAssets(romFile);
    if (!result.success) {
      log.error(`Extraction failed: ${result.error}`);
      setExtractionStates((prev) => ({ ...prev, [romFile]: 'failed' }));
    } else {
      setExtractionStates((prev) => ({ ...prev, [romFile]: 'ready' }));
    }
    await refreshProfilesAndRoms();
  }, [refreshProfilesAndRoms]);

  const handleDeleteRom = useDeleteRom({ ...deps, setExtractionStates });

  return { extractionStates, importingRom, handleImportRom, handleExtractAssets, handleDeleteRom };
};

export { useRomActions };
