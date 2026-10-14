/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import * as languagesStore from '@app/storage/languages-store';
import { LANGUAGE_NAMES } from '../language-names.constants';
import type { LanguageDeleteParams } from './language-manager.type';

const useLanguageDelete = (params: LanguageDeleteParams) => {
  const { selected, setSelected, refresh, packFor, confirmUninstall, onDeleteConfirm } = params;

  const forget = useCallback(async (code: string) => {
    if (selected === code) setSelected(null);
    await refresh();
  }, [selected, setSelected, refresh]);

  const handleDelete = useCallback((code: string) => {
    const owner = packFor(code);
    if (owner) {
      confirmUninstall(owner, () => { void forget(code); });
      return;
    }
    const name = LANGUAGE_NAMES[code] ?? code;
    onDeleteConfirm('Delete Language', `Delete language set "${name}"? This cannot be undone.`, () => {
      void languagesStore.deleteLanguage(code).then(() => forget(code));
    });
  }, [packFor, confirmUninstall, forget, onDeleteConfirm]);

  const handleUninstalled = useCallback(() => {
    if (selected !== null) void forget(selected);
  }, [selected, forget]);

  return { handleDelete, handleUninstalled };
};

export { useLanguageDelete };
