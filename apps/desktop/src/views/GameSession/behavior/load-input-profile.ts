/* @layer renderer-appshell @kind logic */
import type { GameSettings } from '@shared/types/settings';
import type { InputProfile } from '@shared/types/controls';
import { getInputManager } from '@app/lib/game';
import { log } from '@app/lib/log-bus';
import { readInputProfiles } from '@app/lib/storage/profile-data-store';
import { migrateProfilesLoudly } from '@app/lib/input/migrate-profiles';
import { updateActiveInputProfileId } from '@app/lib/storage/profile-store';

const loadInputProfile = async (profileId: string, settings: GameSettings) => {
  try {
    const rawProfiles = await readInputProfiles(profileId);
    const inputProfiles: InputProfile[] = migrateProfilesLoudly(rawProfiles);
    if (inputProfiles.length > 0) {
      const activeId = settings.activeInputProfileId;
      const active = inputProfiles.find(p => p.id === activeId) ?? inputProfiles[0];
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
