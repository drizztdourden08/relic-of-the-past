/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import * as languagesStore from '@app/storage/languages-store';
import type { LanguageCreationParams } from './language-manager.type';

const useLanguageCreation = (params: LanguageCreationParams) => {
  const { refresh, setSelected } = params;
  const [busy, setBusy] = useState(false);

  const handleCreate = useCallback(async (id: string, name: string, base: string) => {
    setBusy(true);
    try {
      await languagesStore.createLanguageSet({ id, name, base });
      await refresh();
      setSelected(id);
    } finally { setBusy(false); }
  }, [refresh, setSelected]);

  const handleDuplicate = useCallback(async (sourceId: string, id: string, name: string) => {
    setBusy(true);
    try {
      await languagesStore.duplicateLanguageSet(sourceId, id, name);
      await refresh();
      setSelected(id);
    } finally { setBusy(false); }
  }, [refresh, setSelected]);

  return { busy, handleCreate, handleDuplicate };
};

export { useLanguageCreation };
