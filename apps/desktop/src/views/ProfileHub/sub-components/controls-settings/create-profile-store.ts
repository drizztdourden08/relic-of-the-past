/* @layer renderer-components @kind logic */
import type { InputProfileStore } from '@drizztdourden08/brock-input/renderer';
import { KEYBOARD_DEFAULT, profileFromPreset } from '@rotp/input-mapping';
import { getInputManager } from '@app/input/input-manager/get-input-manager';
import { readInputProfiles, writeInputProfiles } from '@app/storage/profile-data-store';
import type { CreateProfileStoreArgs } from './controls-settings.type';
import { toBrockProfile } from './to-brock-profile';
import { toRotpProfile } from './to-rotp-profile';

const createProfileStore = ({ profileId, latest }: CreateProfileStoreArgs): InputProfileStore => {
  const rememberActive = (id: string) => {
    const { settings, onChange } = latest.current;
    if (settings.activeInputProfileId !== id) onChange({ activeInputProfileId: id });
  };

  return {
    load: async () => {
      let loaded = await readInputProfiles(profileId);
      if (loaded.length === 0) {
        loaded = [profileFromPreset(KEYBOARD_DEFAULT)];
        await writeInputProfiles(profileId, loaded);
      }
      getInputManager().setProfiles(loaded);
      return loaded.map(toBrockProfile);
    },
    save: async (profiles) => {
      const converted = profiles.map(toRotpProfile);
      getInputManager().setProfiles(converted);
      await writeInputProfiles(profileId, converted);
    },
    get activeId() {
      return latest.current.settings.activeInputProfileId;
    },
    activate: (profile) => {
      getInputManager().setProfile(toRotpProfile(profile));
      rememberActive(profile.id);
    },
    onActiveChange: (listener) => getInputManager().onActiveProfileChange((profile) => {
      listener(toBrockProfile(profile));
      rememberActive(profile.id);
    }),
  };
};

export { createProfileStore };
