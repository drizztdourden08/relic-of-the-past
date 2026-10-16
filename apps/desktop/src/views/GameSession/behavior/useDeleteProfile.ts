/* @layer renderer-appshell @kind hook */
import { useCallback, useEffect } from 'react';
import { profileRemoval } from '@drizztdourden08/brock-react';
import { log } from '@app/log-bus';
import { stopGameBeforeRemove } from './delete-profile-flow';
import type { DeleteProfileDeps } from './useProfileManagement.type';

const useDeleteProfile = (deps: DeleteProfileDeps) => {
  const { profiles, refreshProfilesAndRoms, showDialog, dismissDialog, stopGame, removeConfirmed } = deps;

  useEffect(() => profileRemoval.add(stopGameBeforeRemove(stopGame)), [stopGame]);

  return useCallback((id: string) => {
    const profile = profiles.find((p) => p.id === id);
    if (!profile) return;
    const confirmed = async () => {
      dismissDialog();
      if (await removeConfirmed(profile)) log.app('Profile deleted');
      await refreshProfilesAndRoms();
    };
    showDialog({
      title: 'Delete Profile',
      message: `Delete "${profile.name}"? Its save data will be lost. This cannot be undone.`,
      confirmLabel: 'Delete Profile',
      variant: 'danger',
      onConfirm: () => { void confirmed(); },
    });
  }, [profiles, refreshProfilesAndRoms, showDialog, dismissDialog, removeConfirmed]);
};

export { useDeleteProfile };
