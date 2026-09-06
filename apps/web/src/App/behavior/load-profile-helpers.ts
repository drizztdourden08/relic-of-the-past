/* @layer renderer-appshell @kind logic */
/** Async side-effect helpers for loadProfileForGame (input profile + MSU pack). */
import { setLinkSpriteData, getInputManager } from '../../lib/game';
import type { mergeSettings } from '../../lib/game/settings';
import { log } from '../../lib/log-bus';
import { readInputProfiles } from '@app/lib/storage/profile-data-store';
import { updateActiveInputProfileId } from '@app/lib/storage/profile-store';
import { readSpriteAsZspr } from '@app/lib/game/player-sheet/load-sheet';
import type { InputProfile } from '@shared/types/controls';
import { loadMsuPack } from '@app/lib/game/msu-pack-loader';

type Settings = ReturnType<typeof mergeSettings>;

const loadInputProfile = async (profileId: string, settings: Settings) => {
  try {
    const rawProfiles = await readInputProfiles(profileId);
    const inputProfiles = rawProfiles as InputProfile[];
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
    /* no saved profiles, so InputManager stays on keyboard default */
  }
};

// Stage the profile's selected player sprite for the next boot; the bridge writes it to MEMFS.
// Flattened on the way through, since a sprite pack is not something the core can read.
const loadPlayerSprite = async (settings: Settings) => {
  if (!settings.linkSprite) { setLinkSpriteData(null); return; }
  try {
    const bytes = await readSpriteAsZspr(settings.linkSprite);
    setLinkSpriteData(bytes ?? null);
    if (!bytes) log.app(`[PlayerSprite] Selected sprite "${settings.linkSprite}" not found`);
  } catch (err) {
    log.error(`[PlayerSprite] Failed to load sprite: ${err instanceof Error ? err.message : err}`);
    setLinkSpriteData(null);
  }
};

export { loadInputProfile, loadMsuPack, loadPlayerSprite };
