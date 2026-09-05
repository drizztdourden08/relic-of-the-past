/* @layer bridge-wasm @kind logic */
// One replacement-audio session per profile load. Owns lifetime, wiring and host gates only;
// the engine decides what to play.
import type { MsuPackManifest, MsuResumeState } from '@shared/types/msu-manifest';
import { createMsuEngine } from '../msu/engine';
import type { ChannelReport, MsuChannelName, MsuEngine } from '../msu/engine';
import type { LoadBytes } from '../msu/track-loader';
import { getMasterAudioTarget } from './audio-volume';
import { announceCoreMusic } from './bridge/announce-music';
import { setDeluxeEntrances } from './bridge/deluxe-entrances';
import { restoreCoreMusic } from './bridge/restore-music';
import { setExternalMusic } from './bridge/host-gates';
import { publishSoundClaims, withdrawSoundClaims } from './msu-sound-claims';
import { log } from '../log-bus';

interface MsuSessionOptions {
  manifest: MsuPackManifest;
  loadBytes: LoadBytes;
  isDeluxe: boolean;
  musicVolume: () => number;
  /** Replacement effects are effects: they follow the SFX slider, not the music one. */
  sfxVolume: () => number;
  /** The bed's own slider, so a storm sits under quiet music without touching either. */
  ambientVolume: () => number;
  resumeEnabled: () => boolean;
  /** Whether returning to the title forgets those positions, so the next run starts clean. */
  resetAtTitle: () => boolean;
  /**
   * Whether the pack may replace the ambient bed and the sound effects. Read once at session
   * start (claim masks and gate bits are published then), so a flip takes effect on the next
   * profile load, same as the pack choice.
   */
  replaceAmbient: boolean;
  replaceSfx: boolean;
}

declare global {
  interface Window {
    __onMusicCtrl?: (ctrl: number, module: number, entrance: number, overworldArea: number) => void;
    /** Channel is the core's own index: 0 ambient, 1 sfx1, 2 sfx2. Pan is the two pan bits. */
    __onGameSound?: (channel: number, id: number, pan: number) => void;
    /** The core's synchronous "is this track, remapped, already playing" query. */
    __msuIsPlaying?: (ctrl: number, module: number, entrance: number, overworldArea: number) => boolean;
  }
}

let engine: MsuEngine | null = null;
let pending: MsuSessionOptions | null = null;
let pollId: ReturnType<typeof setInterval> | null = null;

const clearPoll = (): void => {
  if (pollId !== null) { clearInterval(pollId); pollId = null; }
};

const build = (options: MsuSessionOptions): boolean => {
  const target = getMasterAudioTarget();
  if (!target) return false;

  engine = createMsuEngine({
    ctx: target.ctx,
    destination: target.node,
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

  window.__onMusicCtrl = (ctrl, module, entrance, overworldArea) => {
    engine?.onMusicCtrl(ctrl, module, entrance, overworldArea);
  };
  window.__onGameSound = (channel, id, pan) => {
    engine?.onGameSound(channel, id, pan);
  };
  window.__msuIsPlaying = (ctrl, _module, entrance, overworldArea) =>
    engine?.isPlayingTrack(ctrl, entrance, overworldArea) ?? false;
  setExternalMusic(true);
  setDeluxeEntrances(options.isDeluxe);
  const claimed = publishSoundClaims(options.manifest, {
    ambient: options.replaceAmbient, sfx: options.replaceSfx,
  });
  // Only now is anything listening. Whatever the game selected before this point (at boot, or
  // through a loaded state) was reported to nobody and the core will not repeat it, so ask.
  // Has to follow the gate AND the claims: the core checks both.
  announceCoreMusic();
  log.app(`[MSU] Engine attached (${options.manifest.tracks.length} tracks${options.isDeluxe ? ', deluxe' : ''})`);
  const sounds = claimed.ambient + claimed.sfx1 + claimed.sfx2;
  if (sounds > 0) {
    log.app(`[MSU] Claimed ${sounds} sound(s): ${claimed.ambient} ambient, ${claimed.sfx1 + claimed.sfx2} effect(s)`);
  }
  return true;
};

/** Start a session. SDL2 creates its audio context during boot; if it is not up yet, wait for it. */
const startMsuSession = (options: MsuSessionOptions): void => {
  stopMsuSession();
  if (build(options)) return;
  pending = options;
  clearPoll();
  pollId = setInterval(() => {
    if (!pending) { clearPoll(); return; }
    if (build(pending)) { pending = null; clearPoll(); }
  }, 100);
};

const stopMsuSession = (): void => {
  clearPoll();
  pending = null;
  if (!engine) return;
  engine.dispose();
  engine = null;
  window.__onMusicCtrl = undefined;
  window.__onGameSound = undefined;
  window.__msuIsPlaying = undefined;
  // Order matters: the core holds its music port paused while the host owns music, and only
  // rewrites it when the music CHANGES. It will not, because the track it wants is the
  // one it thinks is already playing. Re-announce it while the gate is still on, then release.
  restoreCoreMusic();
  setExternalMusic(false);
  setDeluxeEntrances(false);
  withdrawSoundClaims();
};

/** Live music position and ambient bed for a save's metadata; null when nothing plays. Effects are deliberately absent (nothing to resume). */
const msuSnapshot = (): MsuResumeState | null => engine?.snapshot() ?? null;

/** Resume the music a loaded save was playing. A null state stops music, matching a save with none. */
const msuRestore = (state: MsuResumeState | null): void => { engine?.restore(state); };

const msuSyncVolume = (): void => { engine?.syncVolume(); };

/** One channel's live state, for the music debugger's meters. Null when silent or no session. */
const msuChannelReport = (name: MsuChannelName): ChannelReport | null =>
  engine?.reportChannel(name) ?? null;

const isMsuSessionActive = (): boolean => engine !== null;

export { startMsuSession, stopMsuSession, msuSnapshot, msuRestore, msuSyncVolume, msuChannelReport, isMsuSessionActive };
export type { MsuSessionOptions };
