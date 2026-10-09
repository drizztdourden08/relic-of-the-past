/* @layer bridge-wasm @kind logic */
import * as msuStore from '@app/lib/storage/msu-store';
import { effectivePackManifest } from '@shared/storage/msu-classic-manifest';
import { liveSettingsNow } from '../live-settings';
import { startMsuSession } from '../msu-session';
import { groupVolume } from './group-volume';
import type { PackSessionInput, Settings } from './msu-pack-loader.type';

const readTrackBytes = async (packName: string, fileName: string): Promise<Uint8Array | null> => {
  try {
    const buffer = await msuStore.readMsuTrackFile(packName, fileName);
    return new Uint8Array(buffer);
  } catch {
    return null;
  }
};

const startPackSession = (input: PackSessionInput): void => {
  const { packName, manifest, tracks, isDeluxe, settings } = input;
  const live = (): Settings => liveSettingsNow() ?? settings;
  startMsuSession({
    manifest: effectivePackManifest(packName, manifest, tracks),
    isDeluxe,
    loadBytes: (fileName) => readTrackBytes(packName, fileName),
    musicVolume: () => groupVolume(live(), (s) => (s.musicMuted ? 0 : s.musicVolume)),
    sfxVolume: () => groupVolume(live(), (s) => (s.sfxMuted ? 0 : s.sfxVolume)),
    ambientVolume: () => groupVolume(live(), (s) => (s.ambientMuted ? 0 : s.ambientVolume)),
    resumeEnabled: () => live().resumeMSU,
    resetAtTitle: () => live().resetMSUAtTitle,
    replaceAmbient: settings.packReplaceAmbient && !settings.vanillaSafe,
    replaceSfx: settings.packReplaceSfx && !settings.vanillaSafe,
  });
};

export { startPackSession };
