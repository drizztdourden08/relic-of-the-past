/* @layer renderer-appshell @kind hook */
import { useState, useCallback } from 'react';
import type { PageId } from '../types';

const useAppNavigation = (params: { activeProfile: Profile | null; refreshLists: () => Promise<unknown> }) => {
  const { activeProfile, refreshLists } = params;
  const [activePage, setActivePage] = useState<PageId>('none');

  const closePage = useCallback(() => setActivePage('none'), []);

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
