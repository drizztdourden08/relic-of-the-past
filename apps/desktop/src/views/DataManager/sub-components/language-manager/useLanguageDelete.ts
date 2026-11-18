/* @layer renderer-components @kind hook */
import { useT } from '@drizztdourden08/brock-react';
import * as languagesStore from '@app/storage/languages-store';
import { languageLabel } from '../language-label';
import { usePackRemoval } from '../pack-removal/usePackRemoval';
import type { LanguageDeleteParams } from './language-manager.type';

const useLanguageDelete = (params: LanguageDeleteParams) => {
  const t = useT();
  const promptFor = (code: string) => ({
    title: t('data-manager:language-manager.delete-title'),
    message: t('data-manager:language-manager.delete-message', { name: languageLabel(code, t) }),
  });
  return usePackRemoval({ ...params, promptFor, deleteItem: languagesStore.deleteLanguage });
};

export { useLanguageDelete };
