/* @layer bridge-wasm @kind logic */
/**
 * Binds the replacement-audio engine to a running game: builds it against the game's own audio
 * context, receives the core's music-control and sound events, and arms the host gates that
 * make the core stop producing those sounds itself.
 *
 * One session per profile load. Nothing here decides what to play — that is the engine's job;
 * this only owns the lifetime, the wiring, and what the core is allowed to hand over.
 */
import type { MsuPackManifest, MsuResumeState } from '@shared/types/msu-manifest';
import { createMsuEngine } from '../msu/engine';
import type { MsuEngine } from '../msu/engine';
import type { LoadBytes } from '../msu/track-loader';
import { getMasterAudioTarget } from './audio-volume';
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
  resumeEnabled: () => boolean;
  /**
   * Whether the pack may replace the ambient bed and the sound effects. Read once, here, because
   * the claim masks and gate bits are published to the core at session start — flipping either
   * setting takes effect on the next profile load, the same as the pack choice itself.
   */
  replaceAmbient: boolean;
  replaceSfx: boolean;
}

declare global {
  interface Window {
    __onMusicCtrl?: (ctrl: number, module: number, entrance: number, overworldArea: number) => void;
    /** Channel is the core's own index: 0 ambient, 1 sfx1, 2 sfx2. Pan is the two pan bits. */
    __onGameSound?: (channel: number, id: number, pan: number) => void;
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
    resumeEnabled: options.resumeEnabled,
    onError: (message) => log.error(`[MSU] ${message}`),
    onTrack: (trackNum, layerCount, resumed) =>
      log.app(`[MSU] Track ${trackNum} playing — ${layerCount} layer(s)${resumed ? ', resumed' : ''}`),
    onAmbient: (soundId, layerCount, resumed) =>
      log.app(`[MSU] Ambient ${soundId} playing — ${layerCount} layer(s)${resumed ? ', resumed' : ''}`),
  });

  window.__onMusicCtrl = (ctrl, module, entrance, overworldArea) => {
    engine?.onMusicCtrl(ctrl, module, entrance, overworldArea);
  };
  window.__onGameSound = (channel, id, pan) => {
    engine?.onGameSound(channel, id, pan);
  };
  setExternalMusic(true);
  const claimed = publishSoundClaims(options.manifest, {
    ambient: options.replaceAmbient, sfx: options.replaceSfx,
  });
  log.app(`[MSU] Engine attached (${options.manifest.tracks.length} tracks${options.isDeluxe ? ', deluxe' : ''})`);
  const sounds = claimed.ambient + claimed.sfx1 + claimed.sfx2;
  if (sounds > 0) {
    log.app(`[MSU] Claimed ${sounds} sound(s) — ${claimed.ambient} ambient, ${claimed.sfx1 + claimed.sfx2} effect(s)`);
  }
  return true;
};

/**
 * Start a session. SDL2 creates its audio context during boot, so when the context is not up
 * yet this waits for it rather than losing the session.
 */
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
  // Order matters: the core holds its music port paused while the host owns music, and only
  // rewrites it when the music CHANGES — which it will not, because the track it wants is the
  // one it thinks is already playing. Re-announce it while the gate is still on, then release.
  restoreCoreMusic();
  setExternalMusic(false);
  withdrawSoundClaims();
};

/**
 * Live music position, and the ambient bed playing with it, for embedding in a save's metadata.
 * Null when no session is playing. Effects are deliberately absent — nothing to resume.
 */
const msuSnapshot = (): MsuResumeState | null => engine?.snapshot() ?? null;

/** Resume the music a loaded save was playing. A null state stops music, matching a save with none. */
const msuRestore = (state: MsuResumeState | null): void => { engine?.restore(state); };

const msuSyncVolume = (): void => { engine?.syncVolume(); };

const isMsuSessionActive = (): boolean => engine !== null;

export { startMsuSession, stopMsuSession, msuSnapshot, msuRestore, msuSyncVolume, isMsuSessionActive };
export type { MsuSessionOptions };
