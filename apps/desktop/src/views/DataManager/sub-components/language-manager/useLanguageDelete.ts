/* @layer renderer-components @kind hook */
import * as languagesStore from '@app/storage/languages-store';
import { LANGUAGE_NAMES } from '../language-names.constants';
import { usePackRemoval } from '../pack-removal/usePackRemoval';
import type { LanguageDeleteParams } from './language-manager.type';

const promptFor = (code: string) => ({
  title: 'Delete Language',
  message: `Delete language set "${LANGUAGE_NAMES[code] ?? code}"? This cannot be undone.`,
});

const useLanguageDelete = (params: LanguageDeleteParams) =>
  usePackRemoval({ ...params, promptFor, deleteItem: languagesStore.deleteLanguage });

export { useLanguageDelete };
