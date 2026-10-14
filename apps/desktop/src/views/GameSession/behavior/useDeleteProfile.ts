/* @layer renderer-appshell @kind hook */
import { useCallback } from 'react';
import { log } from '@app/log-bus';
import type { DeleteProfileDeps } from './useProfileManagement.type';

const useDeleteProfile = (deps: DeleteProfileDeps) => {
  const { profiles, activeProfile, refreshProfilesAndRoms, showDialog, dismissDialog, onGameClear, removeConfirmed } = deps;

  return useCallback((id: string) => {
    const profile = profiles.find((p) => p.id === id);
    if (!profile) return;
    const confirmed = async () => {
      dismissDialog();
      if (activeProfile?.id === id) onGameClear();
      removeConfirmed(profile);
      log.app('Profile deleted');
      await refreshProfilesAndRoms();
    };
    showDialog({
      title: 'Delete Profile',
      message: `Delete "${profile.name}"? Its save data will be lost. This cannot be undone.`,
      confirmLabel: 'Delete Profile',
      variant: 'danger',
      onConfirm: () => { void confirmed(); },
    });
  }, [profiles, activeProfile, refreshProfilesAndRoms, showDialog, dismissDialog, onGameClear, removeConfirmed]);
};

export { useDeleteProfile };
