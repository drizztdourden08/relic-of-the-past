/* @layer renderer-components @kind hook */
import { useState, useEffect, useCallback } from 'react';
import type { InputProfile } from '@rotp/input-mapping';
import { getInputManager } from '@app/input/input-manager/get-input-manager';
import { writeInputProfiles } from '@app/storage/profile-data-store';
import { useProfileLoader } from './useProfileLoader';
import type { UseProfileActionsArgs } from './controls-settings.type';

const useProfileState = ({ settings, onChange, profileId }: UseProfileActionsArgs) => {
  const [profiles, setProfiles] = useState<InputProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<InputProfile | null>(null);

  useProfileLoader({ profileId, activeInputProfileId: settings.activeInputProfileId, setProfiles, setActiveProfile });

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

  const updateActiveProfile = useCallback((updatedProfile: InputProfile) => {
    setActiveProfile(updatedProfile);
    getInputManager().setProfile(updatedProfile);
    const updatedProfiles = profiles.map(p => (p.id === updatedProfile.id ? updatedProfile : p));
    void persistProfiles(updatedProfiles);
  }, [profiles, persistProfiles]);

  return { profiles, activeProfile, setActiveProfile, persistProfiles, selectProfile, updateActiveProfile };
};

export { useProfileState };
