/* @layer bridge-wasm @kind logic */
import { createMsuEngine } from '@rotp/msu';
import { log } from '../../log-bus';
import { getMasterAudioTarget } from '@rotp/game-core';
import { announceCoreMusic } from '@rotp/game-core';
import { setDeluxeEntrances } from '@rotp/game-core';
import { setExternalMusic } from '@rotp/game-core';
import { publishSoundClaims } from '@rotp/msu';
import { msuSessionState } from '@rotp/msu';
import type { MsuSessionOptions } from '@rotp/msu';

const createEngine = (ctx: AudioContext, destination: AudioNode, options: MsuSessionOptions) => createMsuEngine({
  ctx,
  destination,
  manifest: options.manifest,
  loadBytes: options.loadBytes,
  isDeluxe: options.isDeluxe,
  musicVolume: options.musicVolume,
  sfxVolume: options.sfxVolume,
  ambientVolume: options.ambientVolume,
  resumeEnabled: options.resumeEnabled,
  resetAtTitle: options.resetAtTitle,
  onError: (message) => log.error(`[MSU] ${message}`),
  onReset: () => log.app('[MSU] Back at the title. Bed and effects stopped, positions cleared'),
  onTrack: (trackNum, layerCount, resumed) =>
    log.app(`[MSU] Track ${trackNum} playing with ${layerCount} layer(s)${resumed ? ', resumed' : ''}`),
  onAmbient: (soundId, layerCount, resumed) =>
    log.app(`[MSU] Ambient ${soundId} playing with ${layerCount} layer(s)${resumed ? ', resumed' : ''}`),
});

const installWindowHooks = (): void => {
  window.__onMusicCtrl = (ctrl, module, entrance, overworldArea) => {
    msuSessionState.engine?.onMusicCtrl(ctrl, module, entrance, overworldArea);
  };
  window.__onGameSound = (channel, id, pan) => {
    msuSessionState.engine?.onGameSound(channel, id, pan);
  };
  window.__msuIsPlaying = (ctrl, _module, entrance, overworldArea) =>
    msuSessionState.engine?.isPlayingTrack(ctrl, entrance, overworldArea) ?? false;
};

const attachEngine = (options: MsuSessionOptions): boolean => {
  const target = getMasterAudioTarget();
  if (!target) return false;
  msuSessionState.engine = createEngine(target.ctx, target.node, options);
  installWindowHooks();
  setExternalMusic(true);
  setDeluxeEntrances(options.isDeluxe);
  const claimed = publishSoundClaims(options.manifest, {
    ambient: options.replaceAmbient, sfx: options.replaceSfx,
  });
  announceCoreMusic();
  log.app(`[MSU] Engine attached (${options.manifest.tracks.length} tracks${options.isDeluxe ? ', deluxe' : ''})`);
  const sounds = claimed.ambient + claimed.sfx1 + claimed.sfx2;
  if (sounds > 0) {
    log.app(`[MSU] Claimed ${sounds} sound(s): ${claimed.ambient} ambient, ${claimed.sfx1 + claimed.sfx2} effect(s)`);
  }
  return true;
};

export { attachEngine };
