/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import { RLANG_EXTENSION } from '@rotp/languages';
import { exportLanguageSet } from '@app/storage/languages-store';
import { getPlatform } from '@drizztdourden08/brock-react';
import type { SetExportParams } from './useSetExport.type';

const useSetExport = (params: SetExportParams) => {
  const { id, dirty, saveNow } = params;
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const exportSet = useCallback(async (): Promise<void> => {
    if (!id) return;
    setExporting(true);
    setExportStatus(null);
    try {
      if (dirty) await saveNow();
      const name = `${id}.${RLANG_EXTENSION}`;
      const bytes = await exportLanguageSet(id);
      const result = await getPlatform().filePicker.saveFile({ name, bytes, extensions: [RLANG_EXTENSION] });
      setExportStatus(result.saved ? `Exported ${result.name ?? name}` : result.error ?? null);
    } catch (err) {
      setExportStatus(err instanceof Error ? err.message : String(err));
    } finally {
      setExporting(false);
    }
  }, [id, dirty, saveNow]);

  return { exporting, exportStatus, exportSet };
};

export { useSetExport };
