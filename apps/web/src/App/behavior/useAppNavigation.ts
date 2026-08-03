/* @layer renderer-appshell @kind hook */
import { useState, useCallback, useEffect } from 'react';
import { useDataViewStore } from '@app/stores/data-view-store';
import type { PageId } from '../types';

const useAppNavigation = (params: { activeProfile: Profile | null; refreshLists: () => Promise<unknown> }) => {
  const { activeProfile, refreshLists } = params;
  const [activePage, setActivePage] = useState<PageId>('none');
  const registerInspectorOpener = useDataViewStore((state) => state.registerInspectorOpener);

  const closePage = useCallback(() => setActivePage('none'), []);

  // A widget that wants to show a recommendation cannot reach page state from
  // where it lives, so the one call it needs is published here, next to the
  // state itself, and withdrawn when this hook goes away.
  useEffect(() => {
    registerInspectorOpener(() => setActivePage('data-inspector'));
    return () => registerInspectorOpener(null);
  }, [registerInspectorOpener]);

  const handleShowProfile = useCallback(async () => {
    if (activeProfile) {
      await refreshLists();
      setActivePage('profile');
    }
  }, [activeProfile, refreshLists]);

  const handleShowDataManager = useCallback(async (tab?: string) => {
    await refreshLists();
    setActivePage('data');
    return tab;
  }, [refreshLists]);

  return {
    activePage,
    setActivePage,
    closePage,
    handleShowProfile,
    handleShowDataManager,
  };
};

export { useAppNavigation };
