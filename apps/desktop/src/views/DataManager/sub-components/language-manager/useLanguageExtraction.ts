/* @layer renderer-components @kind hook */
import { useT } from '@drizztdourden08/brock-react';
import { useCallback } from 'react';
import * as languagesStore from '@app/storage/languages-store';
import type { LanguageExtractionParams } from './language-manager.type';
import { settleExtraction } from './settle-extraction';

const useLanguageExtraction = (params: LanguageExtractionParams) => {
  const { refresh, setSelected } = params;
  const t = useT();

  const handleUrlImport = useCallback(async (url: string) => {
    const result = await languagesStore.extractLanguageFromUrl(url);
    return settleExtraction({ result, refresh, setSelected, t });
  }, [refresh, setSelected, t]);

  const handleFileImport = useCallback(async (files: File[]) => {
    const [file] = files;
    if (file === undefined) return { success: false, message: t('data-manager:language-manager.no-file') };
    const result = await languagesStore.extractLanguageFromFile(file);
    return settleExtraction({ result, refresh, setSelected, t });
  }, [refresh, setSelected, t]);

  return { handleUrlImport, handleFileImport };
};

export { useLanguageExtraction };
