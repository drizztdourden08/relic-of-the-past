/* @layer renderer-appshell @kind logic */
/** Async side-effect helpers for loadProfileForGame (input profile + MSU pack). */
import { setLinkSpriteData, getInputManager } from '../../lib/game';
import type { mergeSettings } from '../../lib/game/settings';
import { log } from '../../lib/log-bus';
import { readInputProfiles } from '@app/lib/storage/profile-data-store';
import { updateActiveInputProfileId } from '@app/lib/storage/profile-store';
import * as msuStore from '@app/lib/storage/msu-store';
import { readLinkSprite } from '@app/lib/storage/link-sprites-store';
import type { InputProfile } from '@shared/types/controls';
import { detectMsuPackProfile, resolveMsuPlayback } from '@shared/features/msu-auto-config';
import { effectivePackManifest } from '@app/lib/msu/classic-manifest';
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
      // Music volume only takes effect once the independent-mix toggle is on, matching the
      // sound chip's own behavior — otherwise replacement music would obey a slider the
      // original music ignores.
      musicVolume: () => (settings.perGroupVolume && !settings.musicMuted ? settings.musicVolume : settings.perGroupVolume ? 0 : 100),
      // Replacement effects are effects, so they read the SFX slider on exactly the same terms.
      sfxVolume: () => (settings.perGroupVolume && !settings.sfxMuted ? settings.sfxVolume : settings.perGroupVolume ? 0 : 100),
      resumeEnabled: () => settings.resumeMSU,
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

// Stage the profile's selected custom player sprite (.zspr) for the next boot; the bridge writes it to MEMFS.
const loadPlayerSprite = async (settings: Settings) => {
  if (!settings.linkSprite) { setLinkSpriteData(null); return; }
  try {
    const bytes = await readLinkSprite(settings.linkSprite);
    setLinkSpriteData(bytes ?? null);
    if (!bytes) log.app(`[PlayerSprite] Selected sprite "${settings.linkSprite}" not found`);
  } catch (err) {
    log.error(`[PlayerSprite] Failed to load sprite: ${err instanceof Error ? err.message : err}`);
    setLinkSpriteData(null);
  }
};

export { loadInputProfile, loadMsuPack, loadPlayerSprite };
