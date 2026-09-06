/* @layer bridge-wasm @kind logic */
/**
 * Starting, stopping and re-starting the replacement-audio session for a profile.
 *
 * Lives here, not beside the other profile-load helpers, because it is not app-shell work:
 * it reads storage and drives the engine, with no React in it, and the Data Manager has to be able
 * to re-run it when someone changes the pack on a profile that is already playing.
 */
import type { mergeSettings } from './settings';
import { log } from '../log-bus';
import * as msuStore from '@app/lib/storage/msu-store';
import { listProfiles, readConfig } from '@app/lib/storage/profile-store';
import { detectMsuPackProfile, resolveMsuPlayback } from '@shared/features/msu-auto-config';
import { effectivePackManifest } from '@shared/storage/msu-classic-manifest';
import { liveSettingsNow } from './live-settings';
import { startMsuSession, stopMsuSession } from './msu-session';
import { mergeSettings as merge } from './settings';

type Settings = ReturnType<typeof mergeSettings>;

/**
 * The profile the live session belongs to. A pack change for any OTHER profile is a stored edit
 * that takes effect the next time that profile is loaded, and must not disturb what is playing.
 */
let sessionProfileId: string | null = null;

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
  sessionProfileId = profile.id;
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
      // sound chip's own behavior. Otherwise replacement music would obey a slider the
      // original music ignores. Effects and the bed read their sliders on the same terms.
      musicVolume: () => groupVolume(live(), (s) => (s.musicMuted ? 0 : s.musicVolume)),
      sfxVolume: () => groupVolume(live(), (s) => (s.sfxMuted ? 0 : s.sfxVolume)),
      ambientVolume: () => groupVolume(live(), (s) => (s.ambientMuted ? 0 : s.ambientVolume)),
      resumeEnabled: () => live().resumeMSU,
      resetAtTitle: () => live().resetMSUAtTitle,
      // Vanilla Safe already stops the session from starting at all (resolveMsuPlayback), but a
      // gate handed to the core is worth denying twice instead of relying on that.
      replaceAmbient: settings.packReplaceAmbient && !settings.vanillaSafe,
      replaceSfx: settings.packReplaceSfx && !settings.vanillaSafe,
    });
    log.app(`[MSU] Pack "${packName}" ready with ${manifest ? `${manifest.tracks.length} authored tracks, ${audioFiles.length} files` : `${tracks.length} tracks`}${plan.isDeluxe ? ', extended numbering' : ''}`);
  } catch (err) {
    log.error(`[MSU] Failed to prepare pack: ${err instanceof Error ? err.message : err}`);
    stopMsuSession();
  }
};

/**
 * Re-run the pack for a profile whose assignment just changed, so the change is audible now
 * instead of at the next boot. A no-op for any profile that is not the one currently playing.
 */
const reloadMsuForProfile = async (profileId: string): Promise<boolean> => {
  if (sessionProfileId !== profileId) return false;
  const profile = (await listProfiles()).find((p) => p.id === profileId);
  if (!profile) return false;
  const saved = await readConfig(profileId);
  await loadMsuPack(profile, merge((saved ?? {}) as Parameters<typeof merge>[0]));
  return true;
};

export { loadMsuPack, reloadMsuForProfile, groupVolume };
