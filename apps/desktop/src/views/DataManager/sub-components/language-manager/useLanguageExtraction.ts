/* @layer renderer-components @kind hook */
import { useT, useText } from '@drizztdourden08/brock-react';
import { useCallback } from 'react';
import * as languagesStore from '@app/storage/languages-store';
import type { LanguageExtractionParams } from './language-manager.type';
import { settleExtraction } from './settle-extraction';

const useLanguageExtraction = (params: LanguageExtractionParams) => {
  const { refresh, setSelected } = params;
  const t = useT();
  const text = useText();

  const handleUrlImport = useCallback(async (url: string) => {
    const result = await languagesStore.extractLanguageFromUrl(url);
    return settleExtraction({ result, refresh, setSelected, t, text });
  }, [refresh, setSelected, t, text]);

  const handleFileImport = useCallback(async (files: File[]) => {
    const [file] = files;
    if (file === undefined) return { success: false, message: t('data-manager:language-manager.no-file') };
    const result = await languagesStore.extractLanguageFromFile(file);
    return settleExtraction({ result, refresh, setSelected, t, text });
  }, [refresh, setSelected, t, text]);

  return { handleUrlImport, handleFileImport };
};

export { useLanguageExtraction };
