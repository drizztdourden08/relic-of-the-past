/* @layer renderer-hooks @kind logic */
import { useT } from '@drizztdourden08/brock-react';
import { useCallback } from 'react';
import { fetchToBytes } from '@app/download/download';
import type { StudioActionsParams } from '../PlayerSpriteStudio.type';
import { spriteNameFromUrl } from './sprite-name-from-url';

const useStudioActions = (params: StudioActionsParams) => {
  const t = useT();
  const { openFile, packFor, confirmUninstall, onDeleteConfirm, run, library, draft } = params;

  const handleUrlImport = useCallback(async (url: string) => {
    const bytes = await fetchToBytes(url);
    return library.importBytes(spriteNameFromUrl(url), bytes);
  }, [library]);

  const isInstalled = useCallback((name: string) => packFor(name) !== null, [packFor]);

  const handleDelete = useCallback((name: string) => {
    const owner = packFor(name);
    if (owner) {
      confirmUninstall(owner, () => {
        if (openFile === name) draft.close();
        void library.refresh();
      });
      return;
    }
    const message = t('views-player-sprite-studio:delete.message', { name });
    onDeleteConfirm(t('views-player-sprite-studio:delete.title'), message, () => {
      if (openFile === name) draft.close();
      void library.remove(name);
    });
  }, [packFor, confirmUninstall, openFile, onDeleteConfirm, draft, library, t]);

  const openAfter = useCallback((name: string) => {
    void run(async () => { await library.refresh(); await draft.open(name); });
  }, [run, library, draft]);

  const handleUninstalled = useCallback(() => {
    draft.close();
    void library.refresh();
  }, [draft, library]);

  return { handleUrlImport, isInstalled, handleDelete, openAfter, handleUninstalled };
};

export { useStudioActions };
