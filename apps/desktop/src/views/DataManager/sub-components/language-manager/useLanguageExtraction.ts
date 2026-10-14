/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import * as languagesStore from '@app/storage/languages-store';
import type { LanguageExtractionParams } from './language-manager.type';
import { settleExtraction } from './settle-extraction';

const useLanguageExtraction = (params: LanguageExtractionParams) => {
  const { refresh, setSelected } = params;
  const [extractLang, setExtractLang] = useState('');

  const handleUrlImport = useCallback(async (url: string) => {
    if (!extractLang) return { success: false, message: 'Select a language first' };
    const result = await languagesStore.extractLanguageFromUrl(url, extractLang);
    return settleExtraction({ result, code: extractLang, refresh, setSelected });
  }, [extractLang, refresh, setSelected]);

  const handleFileImport = useCallback(async (files: File[]) => {
    const [file] = files;
    if (file === undefined) return { success: false, message: 'No file selected' };
    if (!extractLang) return { success: false, message: 'Select a language first' };
    const result = await languagesStore.extractLanguageFromFile(file, extractLang);
    return settleExtraction({ result, code: extractLang, refresh, setSelected });
  }, [extractLang, refresh, setSelected]);

  return { extractLang, setExtractLang, handleUrlImport, handleFileImport };
};

export { useLanguageExtraction };
