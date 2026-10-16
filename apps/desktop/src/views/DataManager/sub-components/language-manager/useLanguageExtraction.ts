/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import * as languagesStore from '@app/storage/languages-store';
import type { LanguageExtractionParams } from './language-manager.type';
import { settleExtraction } from './settle-extraction';

const useLanguageExtraction = (params: LanguageExtractionParams) => {
  const { refresh, setSelected } = params;

  const handleUrlImport = useCallback(async (url: string) => {
    const result = await languagesStore.extractLanguageFromUrl(url);
    return settleExtraction({ result, refresh, setSelected });
  }, [refresh, setSelected]);

  const handleFileImport = useCallback(async (files: File[]) => {
    const [file] = files;
    if (file === undefined) return { success: false, message: 'No file selected' };
    const result = await languagesStore.extractLanguageFromFile(file);
    return settleExtraction({ result, refresh, setSelected });
  }, [refresh, setSelected]);

  return { handleUrlImport, handleFileImport };
};

export { useLanguageExtraction };
