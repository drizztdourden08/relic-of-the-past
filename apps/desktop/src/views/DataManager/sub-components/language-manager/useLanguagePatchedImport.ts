/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import type { PatchedPartReport } from '@rotp/asset-extraction';
import * as languagesStore from '@app/storage/languages-store';
import type { PatchedImportRequest } from '@app/storage/languages-store/patched-import.type';
import type { LanguageCreationParams } from './language-manager.type';

const useLanguagePatchedImport = (params: LanguageCreationParams) => {
  const { refresh, setSelected } = params;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parts, setParts] = useState<readonly PatchedPartReport[]>([]);

  const handlePatchedImport = useCallback(async (fields: PatchedImportRequest): Promise<boolean> => {
    setBusy(true);
    setError(null);
    setParts([]);
    try {
      const result = await languagesStore.importPatchedLanguage(fields);
      setParts(result.parts);
      if (!result.success) {
        setError(result.error);
        return false;
      }
      await refresh();
      setSelected(result.code);
      return true;
    } finally { setBusy(false); }
  }, [refresh, setSelected]);

  return { busy, error, parts, handlePatchedImport };
};

export { useLanguagePatchedImport };
