/* @layer renderer-appshell @kind hook */
import { useState, useCallback } from 'react';
import type { ProfileHubTab } from '../../ui/domains/app/views/ProfileHub/ProfileHub.type';
import type { AppViewCallbacksParams } from './useAppViewCallbacks.type';

const useAppViewCallbacks = (params: AppViewCallbacksParams) => {
  const { profileMgmt, nav } = params;

  const [dataTab, setDataTab] = useState<string>('profiles');
  const [profileHubTab, setProfileHubTab] = useState<ProfileHubTab>('home');

  const handleShowProfile = useCallback(async (tab?: ProfileHubTab) => {
    if (profileMgmt.activeProfile) {
      if (tab) setProfileHubTab(tab);
      await profileMgmt.refreshProfilesAndRoms();
      nav.setActivePage('profile');
    }
  }, [profileMgmt, nav]);

  const handleShowDataManager = useCallback(async (tab?: string) => {
    if (tab) setDataTab(tab);
    await profileMgmt.refreshProfilesAndRoms();
    nav.setActivePage('data');
  }, [profileMgmt, nav]);

  return {
    dataTab, profileHubTab, setProfileHubTab,
    handleShowProfile, handleShowDataManager,
  };
};

export { useAppViewCallbacks };
