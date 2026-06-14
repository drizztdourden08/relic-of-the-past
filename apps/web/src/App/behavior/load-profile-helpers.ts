/* @layer renderer-appshell @kind logic */
/** Async side-effect helpers for loadProfileForGame (input profile + MSU pack). */
import { setMsuData, getInputManager } from '../../lib/game';
import type { mergeSettings } from '../../lib/game/settings';
import { log } from '../../lib/log-bus';
import { readInputProfiles } from '@app/lib/storage/profile-data-store';
import type { InputProfile } from '@shared/types/controls';

type Settings = ReturnType<typeof mergeSettings>;

const loadInputProfile = async (profileId: string, settings: Settings) => {
  try {
    const rawProfiles = await readInputProfiles(profileId);
    const inputProfiles = rawProfiles as InputProfile[];
    if (inputProfiles.length > 0) {
      const activeId = settings.activeInputProfileId;
      const active = inputProfiles.find(p => p.id === activeId) ?? inputProfiles[0];
      getInputManager().setProfile(active);
      log.app(`Loaded input profile: ${active.name}`);
    }
  } catch {
    /* no saved profiles — InputManager stays on keyboard default */
  }
};

const loadMsuPack = async (profile: Profile, settings: Settings) => {
  // Load MSU pack into staging memory if enabled
  if (profile.msuPack && settings.enableMSU !== 'false') {
    log.app(`[MSU] Loading pack "${profile.msuPack}"...`);
    try {
      const trackList = await window.api.getMsuTrackList(profile.msuPack);
      if (trackList.length > 0) {
        const tracks: { num: number; ext: string; data: Uint8Array }[] = [];
        for (let i = 0; i < trackList.length; i += 5) {
          const batch = trackList.slice(i, i + 5);
          const results = await Promise.all(
            batch.map((t) => window.api.readMsuTrackFile(profile.msuPack!, t.fileName)),
          );
          for (let j = 0; j < batch.length; j++) {
            tracks.push({ num: batch[j].trackNum, ext: batch[j].ext, data: new Uint8Array(results[j]) });
          }
        }
        setMsuData(tracks);
        const hasDeluxe = tracks.some((t) => t.num >= 37);
        if (hasDeluxe && settings.enableMSU === 'true') {
          settings.enableMSU = 'deluxe';
          log.app(`[MSU] Deluxe pack detected — upgraded EnableMSU to 'deluxe'`);
        }
        log.app(`[MSU] Loaded ${tracks.length} tracks (${(tracks.reduce((s, t) => s + t.data.byteLength, 0) / (1024 * 1024)).toFixed(0)} MB)`);
      }
    } catch (err) {
      log.error(`[MSU] Failed to load pack: ${err instanceof Error ? err.message : err}`);
      setMsuData(null);
    }
  } else {
    setMsuData(null);
  }
};

export { loadInputProfile, loadMsuPack };
