/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import type { InputProfile } from '@rotp/input-mapping';
import { getInputManager } from '@app/input/input-manager/get-input-manager';
import { buildCustomProfile } from './build-custom-profile';
import { useProfileState } from './useProfileState';
import type { UseProfileActionsArgs } from './controls-settings.type';

const useProfileActions = (args: UseProfileActionsArgs) => {
  const { profiles, activeProfile, setActiveProfile, persistProfiles, selectProfile, updateActiveProfile } = useProfileState(args);
  const [deleteTarget, setDeleteTarget] = useState<InputProfile | null>(null);
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);

  const handleCreate = useCallback(() => {
    const newProfile = buildCustomProfile(profiles.length);
    void persistProfiles([...profiles, newProfile]);
    selectProfile(newProfile);
    setNewlyCreatedId(newProfile.id);
  }, [profiles, persistProfiles, selectProfile]);

  const handleRename = useCallback((profile: InputProfile, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === profile.name) return;

    const updatedProfile: InputProfile = { ...profile, name: trimmed, modifiedAt: Date.now() };
    const updatedProfiles = profiles.map(p => (p.id === updatedProfile.id ? updatedProfile : p));

    if (activeProfile?.id === updatedProfile.id) {
      setActiveProfile(updatedProfile);
      getInputManager().setProfile(updatedProfile);
    }
    void persistProfiles(updatedProfiles);
  }, [profiles, activeProfile, persistProfiles, setActiveProfile]);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    const updated = profiles.filter(p => p.id !== deleteTarget.id);
    void persistProfiles(updated);
    if (activeProfile?.id === deleteTarget.id) {
      const fallback = updated[0] ?? null;
      if (fallback) selectProfile(fallback);
    }
    setDeleteTarget(null);
  }, [deleteTarget, profiles, activeProfile, persistProfiles, selectProfile]);

  return {
    profiles,
    activeProfile,
    deleteTarget,
    newlyCreatedId,
    setDeleteTarget,
    selectProfile,
    persistProfiles,
    updateActiveProfile,
    handleCreate,
    handleRename,
    handleDeleteConfirm,
  };
};

export { useProfileActions };
