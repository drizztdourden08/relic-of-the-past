/* @layer renderer-appshell @kind hook */
/** App-level view-navigation glue: data/profile-hub tab state + page-switch callbacks. */
import { useState, useCallback } from 'react';
import type { ConfirmDialog } from '../types';
import type { ProfileHubTab } from '../../ui/domains/app/views/ProfileHub/ProfileHub.type';
import type { useGameLifecycle } from './useGameLifecycle';
import type { useProfileManagement } from './useProfileManagement';
import type { useAppNavigation } from './useAppNavigation';

interface AppViewCallbacksParams {
  game: ReturnType<typeof useGameLifecycle>;
  showDialog: (config: ConfirmDialog) => void;
  dismissDialog: () => void;
  profileMgmt: ReturnType<typeof useProfileManagement>;
  nav: ReturnType<typeof useAppNavigation>;
}

const useAppViewCallbacks = (params: AppViewCallbacksParams) => {
  const { game, showDialog, dismissDialog, profileMgmt, nav } = params;

  const [dataTab, setDataTab] = useState<string>('profiles');
  const [profileHubTab, setProfileHubTab] = useState<ProfileHubTab>('home');

  // The optional tab lets a caller deep-link straight to the settings it is talking about —
  // the incompatible-refresh-rate tag uses it to land on Display.
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
