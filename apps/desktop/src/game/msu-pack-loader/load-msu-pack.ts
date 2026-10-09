/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import * as msuStore from '@app/storage/msu-store';
import { detectMsuPackProfile, resolveMsuPlayback } from '@rotp/features';
import { stopMsuSession } from '../msu-session';
import { msuPackSessionOwner } from '@rotp/msu';
import type { Settings } from '@rotp/msu';
import { startPackSession } from './start-pack-session';

const loadMsuPack = async (profile: Profile, settings: Settings) => {
  stopMsuSession();
  msuPackSessionOwner.profileId = profile.id;
  if (!profile.msuPack) return;
  const packName = profile.msuPack;

  try {
    const tracks = await msuStore.getMsuTrackList(packName);
    const manifest = await msuStore.readMsuManifest(packName);
    const audioFiles = manifest ? await msuStore.listMsuAudioFiles(packName) : [];
    if (!manifest && tracks.length === 0) {
      log.app(`[MSU] Pack "${packName}" has no playable tracks`);
      return;
    }

    const plan = resolveMsuPlayback(settings, detectMsuPackProfile(tracks, manifest !== null));
    settings.enableMSU = plan.resolved.enableMSU;
    settings.audioFreq = plan.resolved.audioFreq;
    settings.audioChannels = plan.resolved.audioChannels;
    settings.audioSamples = plan.resolved.audioSamples;

    if (!plan.enabled) {
      log.app(`[MSU] Replacement music off for this profile`);
      return;
    }
    log.app(`[MSU] Resolved '${plan.resolved.enableMSU}' @ ${plan.resolved.audioFreq}Hz, ${plan.resolved.audioChannels}ch, buffer ${plan.resolved.audioSamples}`);

    startPackSession({ packName, manifest, tracks, isDeluxe: plan.isDeluxe, settings });
    log.app(`[MSU] Pack "${packName}" ready with ${manifest ? `${manifest.tracks.length} authored tracks, ${audioFiles.length} files` : `${tracks.length} tracks`}${plan.isDeluxe ? ', extended numbering' : ''}`);
  } catch (err) {
    log.error(`[MSU] Failed to prepare pack: ${err instanceof Error ? err.message : err}`);
    stopMsuSession();
  }
};

export { loadMsuPack };
