/* @layer renderer-appshell @kind logic */
/** Async side-effect helpers for loadProfileForGame (input profile + MSU pack). */
import { setLinkSpriteData, getInputManager } from '../../lib/game';
import type { mergeSettings } from '../../lib/game/settings';
import { log } from '../../lib/log-bus';
import { readInputProfiles } from '@app/lib/storage/profile-data-store';
import { updateActiveInputProfileId } from '@app/lib/storage/profile-store';
import * as msuStore from '@app/lib/storage/msu-store';
import { readSpriteAsZspr } from '@app/lib/game/player-sheet/load-sheet';
import type { InputProfile } from '@shared/types/controls';
import { detectMsuPackProfile, resolveMsuPlayback } from '@shared/features/msu-auto-config';
import { effectivePackManifest } from '@shared/storage/msu-classic-manifest';
import { liveSettingsNow } from '@app/lib/game/live-settings';
import { startMsuSession, stopMsuSession } from '@app/lib/game/msu-session';

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
    /* no saved profiles — InputManager stays on keyboard default */
  }
};

/**
 * Hands the profile's music pack to the audio engine. Nothing is preloaded: the engine reads
 * and decodes a track the first time the game asks for it, so assigning a multi-gigabyte pack
 * no longer costs anything at boot.
 */
/** One group's effective volume: the slider when independent mix is on, full passthrough when off. */
const groupVolume = (s: Settings, read: (s: Settings) => number): number =>
  (s.perGroupVolume ? read(s) : 100);

const loadMsuPack = async (profile: Profile, settings: Settings) => {
  stopMsuSession();
  if (!profile.msuPack) return;
  const packName = profile.msuPack;

  try {
    const tracks = await msuStore.getMsuTrackList(packName);
    const manifest = await msuStore.readMsuManifest(packName);
    // A pack with no manifest is a classic one: its numbered files become one layer each.
    const audioFiles = manifest ? await msuStore.listMsuAudioFiles(packName) : [];
    if (!manifest && tracks.length === 0) {
      log.app(`[MSU] Pack "${packName}" has no playable tracks`);
      return;
    }

    const plan = resolveMsuPlayback(settings, detectMsuPackProfile(tracks, manifest !== null));
    // In Auto these were derived from the pack; write them back so the boot INI, the settings UI
    // and the audio device all agree with what is actually going to play.
    settings.enableMSU = plan.resolved.enableMSU;
    settings.audioFreq = plan.resolved.audioFreq;
    settings.audioChannels = plan.resolved.audioChannels;
    settings.audioSamples = plan.resolved.audioSamples;

    if (!plan.enabled) {
      log.app(`[MSU] Replacement music off for this profile`);
      return;
    }
    log.app(`[MSU] Resolved '${plan.resolved.enableMSU}' @ ${plan.resolved.audioFreq}Hz, ${plan.resolved.audioChannels}ch, buffer ${plan.resolved.audioSamples}`);

    const live = (): Settings => liveSettingsNow() ?? settings;
    startMsuSession({
      manifest: effectivePackManifest(packName, manifest, tracks),
      isDeluxe: plan.isDeluxe,
      loadBytes: async (fileName) => {
        try {
          const buffer = await msuStore.readMsuTrackFile(packName, fileName);
          return new Uint8Array(buffer);
        } catch {
          return null;
        }
      },
      // Every callback reads the settings AS THEY ARE, not as they were when the profile
      // loaded: these closures live for the whole session, and a captured snapshot would pin
      // the sliders to their boot-time values. The load-time object is only the fallback for
      // the moments before the first live push.
      //
      // Music volume only takes effect once the independent-mix toggle is on, matching the
      // sound chip's own behavior — otherwise replacement music would obey a slider the
      // original music ignores. Effects and the bed read their sliders on the same terms.
      musicVolume: () => groupVolume(live(), (s) => (s.musicMuted ? 0 : s.musicVolume)),
      sfxVolume: () => groupVolume(live(), (s) => (s.sfxMuted ? 0 : s.sfxVolume)),
      ambientVolume: () => groupVolume(live(), (s) => (s.ambientMuted ? 0 : s.ambientVolume)),
      resumeEnabled: () => live().resumeMSU,
      // Vanilla Safe already stops the session from starting at all (resolveMsuPlayback), but a
      // gate handed to the core is worth denying twice rather than relying on that.
      replaceAmbient: settings.packReplaceAmbient && !settings.vanillaSafe,
      replaceSfx: settings.packReplaceSfx && !settings.vanillaSafe,
    });
    log.app(`[MSU] Pack "${packName}" ready — ${manifest ? `${manifest.tracks.length} authored tracks, ${audioFiles.length} files` : `${tracks.length} tracks`}${plan.isDeluxe ? ', extended numbering' : ''}`);
  } catch (err) {
    log.error(`[MSU] Failed to prepare pack: ${err instanceof Error ? err.message : err}`);
    stopMsuSession();
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
