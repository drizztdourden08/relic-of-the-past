/* @layer renderer-components @kind hook */
import { useState, useEffect, useCallback, useRef } from 'react';
import type { InputProfile } from '@shared/types/controls';
import { KEYBOARD_DEFAULT } from '@shared/input';
import { getInputManager, profileFromPreset } from '../../../../../../../lib/input/input-manager';
import { readInputProfiles, writeInputProfiles } from '@app/lib/storage/profile-data-store';
import { migrateProfilesLoudly } from '@app/lib/input/migrate-profiles';
import type { UseProfileActionsArgs } from './controls-settings.type';

const useProfileActions = ({ settings, onChange, profileId }: UseProfileActionsArgs) => {
  const [profiles, setProfiles] = useState<InputProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<InputProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InputProfile | null>(null);
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    (async () => {
      const raw = await readInputProfiles(profileId);
      let loaded: InputProfile[] = migrateProfilesLoudly(raw);

      if (loaded.length === 0) {
        const defaultProfile = profileFromPreset(KEYBOARD_DEFAULT);
        loaded = [defaultProfile];
        await writeInputProfiles(profileId, loaded);
      }

      setProfiles(loaded);
      const activeId = settings.activeInputProfileId;
      const active = loaded.find(p => p.id === activeId) ?? loaded[0];
      setActiveProfile(active);
      getInputManager().setProfiles(loaded);
      getInputManager().setProfile(active);
    })();
  }, [profileId, settings.activeInputProfileId]);

  useEffect(() => {
    return getInputManager().onActiveProfileChange((profile) => {
      setActiveProfile(profile);
      onChange({ activeInputProfileId: profile.id });
    });
  }, [onChange]);

  const persistProfiles = useCallback(async (updated: InputProfile[]) => {
    setProfiles(updated);
    getInputManager().setProfiles(updated);
    await writeInputProfiles(profileId, updated);
  }, [profileId]);

  const selectProfile = useCallback((profile: InputProfile) => {
    setActiveProfile(profile);
    getInputManager().setProfile(profile);
    onChange({ activeInputProfileId: profile.id });
  }, [onChange]);

  const handleCreate = useCallback(() => {
    const newProfile: InputProfile = {
      id: `custom-${Date.now()}`,
      name: `Custom Profile ${profiles.length + 1}`,
      deviceType: 'keyboard',
      deviceFamily: 'keyboard',
      mappings: [...KEYBOARD_DEFAULT.defaultMappings],
      isDefault: false,
      assignedDevice: null,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };
    const updated = [...profiles, newProfile];
    persistProfiles(updated);
    selectProfile(newProfile);
    setNewlyCreatedId(newProfile.id);
  }, [profiles, persistProfiles, selectProfile]);

  const handleRename = useCallback((profile: InputProfile, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === profile.name) return;

    const updatedProfile: InputProfile = {
      ...profile,
      name: trimmed,
      modifiedAt: Date.now(),
    };

    const updatedProfiles = profiles.map(p =>
      p.id === updatedProfile.id ? updatedProfile : p
    );

    if (activeProfile?.id === updatedProfile.id) {
      setActiveProfile(updatedProfile);
      getInputManager().setProfile(updatedProfile);
    }
    persistProfiles(updatedProfiles);
  }, [profiles, activeProfile, persistProfiles]);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    const updated = profiles.filter(p => p.id !== deleteTarget.id);
    persistProfiles(updated);
    if (activeProfile?.id === deleteTarget.id) {
      const fallback = updated[0] ?? null;
      if (fallback) selectProfile(fallback);
    }
    setDeleteTarget(null);
  }, [deleteTarget, profiles, activeProfile, persistProfiles, selectProfile]);

  const updateActiveProfile = useCallback((updatedProfile: InputProfile) => {
    setActiveProfile(updatedProfile);
    getInputManager().setProfile(updatedProfile);
    const updatedProfiles = profiles.map(p =>
      p.id === updatedProfile.id ? updatedProfile : p
    );
    persistProfiles(updatedProfiles);
  }, [profiles, persistProfiles]);

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
