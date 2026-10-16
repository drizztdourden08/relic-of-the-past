/* @layer renderer-appshell @kind hook */
import { useCallback } from 'react';
import { log } from '@app/log-bus';
import { runDeleteProfile } from './delete-profile-flow';
import type { DeleteProfileDeps } from './useProfileManagement.type';

const useDeleteProfile = (deps: DeleteProfileDeps) => {
  const { profiles, activeProfile, refreshProfilesAndRoms, showDialog, dismissDialog, stopGame, selectProfile, removeConfirmed } = deps;

  return useCallback((id: string) => {
    const profile = profiles.find((p) => p.id === id);
    if (!profile) return;
    const confirmed = async () => {
      dismissDialog();
      await runDeleteProfile(profile, { profiles, activeProfile, stopGame, selectProfile, removeConfirmed });
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
  }, [profiles, activeProfile, refreshProfilesAndRoms, showDialog, dismissDialog, stopGame, selectProfile, removeConfirmed]);
};

export { useDeleteProfile };
