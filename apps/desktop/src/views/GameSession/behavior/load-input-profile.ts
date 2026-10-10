/* @layer renderer-appshell @kind logic */
import type { GameSettings } from '@rotp/features';
import type { InputProfile } from '@rotp/input-mapping';
import { getInputManager } from '@app/game';
import { log } from '@app/log-bus';
import { readInputProfiles } from '@app/storage/profile-data-store';
import { migrateProfilesLoudly } from '@rotp/input-mapping';
import { updateActiveInputProfileId } from '@app/storage/profile-store';

const loadInputProfile = async (profileId: string, settings: GameSettings) => {
  try {
    const rawProfiles = await readInputProfiles(profileId);
    const inputProfiles: InputProfile[] = migrateProfilesLoudly(rawProfiles);
    const [firstProfile] = inputProfiles;
    if (firstProfile) {
      const activeId = settings.activeInputProfileId;
      const active = inputProfiles.find(p => p.id === activeId) ?? firstProfile;
      const mgr = getInputManager();
      mgr.setProfiles(inputProfiles);
      mgr.setActiveProfilePersist((id) => { void updateActiveInputProfileId(profileId, id); });
      mgr.setProfile(active);
      log.app(`Loaded input profile: ${active.name}`);
    }
  } catch {
    return;
  }
};

export { loadInputProfile };
