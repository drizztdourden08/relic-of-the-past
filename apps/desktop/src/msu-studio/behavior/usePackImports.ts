/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import * as msuStore from '@app/storage/msu-store';
import { isMsulName } from './is-msul-name';
import { skipNote } from './skip-note';
import { usePackImport } from './usePackImport';
import type { ActionResult } from '../msu.type';
import type { PackImportsParams } from './pack-imports.type';
import type { StoreImport } from './store-import.type';

const usePackImports = (params: PackImportsParams) => {
  const { newPackName, setNewPackName, refresh, setSelected } = params;
  const { importMsul } = usePackImport({ refresh, onImported: setSelected });

  const settleImport = useCallback(async (pack: string, result: StoreImport, failure: string): Promise<ActionResult> => {
    if (!result.success) return { success: false, message: result.error ?? failure };
    await refresh();
    setSelected(pack);
    setNewPackName('');
    return { success: true, message: `Imported ${result.fileCount ?? 0} audio files${skipNote(result)}` };
  }, [refresh, setSelected, setNewPackName]);

  const handleUrlImport = useCallback(async (url: string): Promise<ActionResult> => {
    const pack = newPackName.trim() || `pack-${Date.now()}`;
    return settleImport(pack, await msuStore.importMsu(pack, url), 'Download failed');
  }, [newPackName, settleImport]);

  const handleFileImport = useCallback(async (dropped: File[]): Promise<ActionResult> => {
    const [file] = dropped;
    if (file === undefined) return { success: false, message: 'No file selected' };
    if (isMsulName(file.name)) {
      const result = await importMsul(file, newPackName.trim());
      if (result.success) setNewPackName('');
      return result;
    }
    const pack = newPackName.trim() || `pack-${Date.now()}`;
    return settleImport(pack, await msuStore.importMsuFile(pack, file), 'Import failed');
  }, [newPackName, setNewPackName, importMsul, settleImport]);

  return { handleUrlImport, handleFileImport };
};

export { usePackImports };
