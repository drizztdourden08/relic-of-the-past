/* @layer renderer-appshell @kind hook */
/** App-level view-navigation glue: data/profile-hub tab state + page-switch callbacks. */
import { useState, useCallback } from 'react';
import type { ConfirmDialog } from '../types';
import type { ProfileHubTab } from '../../components/views/ProfileHub/types';
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

  // ─── Navigation with game-running confirmation ───
  const handleShowPicker = useCallback(async () => {
    if (game.isRunning) {
      showDialog({
        title: 'Switch Profile',
        message: 'This will close the currently running game. Any unsaved progress will be lost.',
        confirmLabel: 'Switch Profile',
        variant: 'default',
        onConfirm: async () => {
          dismissDialog();
          game.clearGame();
          profileMgmt.setActiveProfile(null);
          await nav.handleShowPicker();
        },
      });
    } else {
      await nav.handleShowPicker();
    }
  }, [game, showDialog, dismissDialog, profileMgmt, nav]);

  const handleShowProfile = useCallback(async () => {
    if (profileMgmt.activeProfile) {
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
    handleShowPicker, handleShowProfile, handleShowDataManager,
  };
};

export { useAppViewCallbacks };
