/* @layer renderer-components @kind hook */
/**
 * Exports the open set as `.rlang` through the platform's save path: a save dialog on desktop,
 * a share sheet on mobile, a download in a browser. A pending edit is written first, so the
 * file holds what the editor shows. A cancelled dialog is an ordinary outcome, not a failure.
 */
import { useCallback, useState } from 'react';
import { RLANG_EXTENSION } from '@shared/storage/languages';
import { exportLanguageSet } from '@app/lib/storage/languages-store';
import { getPlatform } from '@app/platform/get-platform';

type SetExportParams = {
  id: string | null;
  dirty: boolean;
  saveNow: () => Promise<void>;
};

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
export type { SetExportParams };
