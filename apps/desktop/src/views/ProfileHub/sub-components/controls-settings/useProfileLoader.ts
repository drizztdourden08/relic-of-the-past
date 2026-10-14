/* @layer renderer-components @kind hook */
import { useEffect, useRef } from 'react';
import { KEYBOARD_DEFAULT, profileFromPreset, migrateProfilesLoudly } from '@rotp/input-mapping';
import { getInputManager } from '@app/input/input-manager/get-input-manager';
import { readInputProfiles, writeInputProfiles } from '@app/storage/profile-data-store';
import { firstProfile } from './first-profile';
import type { InputProfile } from '@rotp/input-mapping';
import type { UseProfileLoaderArgs } from './controls-settings.type';

const useProfileLoader = ({ profileId, activeInputProfileId, setProfiles, setActiveProfile }: UseProfileLoaderArgs) => {
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    void (async () => {
      const raw = await readInputProfiles(profileId);
      let loaded: InputProfile[] = migrateProfilesLoudly(raw);

      if (loaded.length === 0) {
        const defaultProfile = profileFromPreset(KEYBOARD_DEFAULT);
        loaded = [defaultProfile];
        await writeInputProfiles(profileId, loaded);
      }

      setProfiles(loaded);
      const active = loaded.find(p => p.id === activeInputProfileId) ?? firstProfile(loaded);
      setActiveProfile(active);
      getInputManager().setProfiles(loaded);
      getInputManager().setProfile(active);
    })();
  }, [profileId, activeInputProfileId, setProfiles, setActiveProfile]);
};

export { useProfileLoader };
