/* @layer bridge-wasm @kind logic */
/**
 * Plays the sound chip's own version of a sound, for A/B against a replacement. One buffer, no
 * layers, no schedule, no volume shaping; only one plays at a time. Short renders are cached
 * (deterministic); long ones are NOT (a minute of float32 stereo is ~15 MB per music slot for a
 * render that takes a tenth of a second).
 */
import { canPreviewOriginals, renderOriginalSound } from './bridge/sound-preview';
import type { PreviewTarget } from './bridge/sound-preview';
import { ensurePreviewModule } from './preview-core';

/**
 * How much of each target to render. A one-shot is trimmed afterwards, so its figure only has to
 * exceed the longest effect (the fanfares). Music and beds never end, so their figure IS the
 * preview length; pack tracks run about a minute, and an eight-second preview cut off mid-phrase.
 */
const PREVIEW_SECONDS: Record<PreviewTarget, number> = {
  music: 60,
  ambient: 30,
  sfx1: 10,
  sfx2: 10,
};

/** Below this a sample counts as silence when trimming a one-shot's tail. */
const SILENCE_FLOOR = 24;

/** Renders longer than this are re-made on demand, not kept; see the note above. */
const CACHEABLE_SECONDS = 12;

/** The targets the chip plays until told to stop. Their preview loops, because stopping at the render window's edge reads as the sound being cut off. */
const CONTINUOUS: PreviewTarget[] = ['music', 'ambient'];

interface OriginalSound {
  buffer: AudioBuffer;
  /** False when the chip produces nothing at all for this id. */
  audible: boolean;
}

let context: AudioContext | null = null;
let playing: AudioBufferSourceNode | null = null;
const cache = new Map<string, OriginalSound>();

const keyOf = (target: PreviewTarget, soundId: number): string => `${target}:${soundId}`;

const audioContext = (): AudioContext => {
  context ??= new AudioContext();
  return context;
};

/** Where the sound ends. A one-shot's window is mostly digital silence; trimming stops a half-second bonk from holding "playing" for the whole window. */
const audibleLength = (samples: Int16Array): number => {
  for (let i = samples.length - 2; i >= 0; i -= 2) {
    if (Math.abs(samples[i]) > SILENCE_FLOOR || Math.abs(samples[i + 1]) > SILENCE_FLOOR) {
      return (i >> 1) + 1;
    }
  }
  return 0;
};

const toAudioBuffer = (samples: Int16Array, sampleRate: number, frames: number): AudioBuffer => {
  const buffer = audioContext().createBuffer(2, Math.max(1, frames), sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);
  for (let i = 0; i < frames; i++) {
    left[i] = samples[i * 2] / 32768;
    right[i] = samples[i * 2 + 1] / 32768;
  }
  return buffer;
};

/** Render (or recall) the chip's version of one sound. Null when the core cannot produce it. */
const loadOriginalSound = (target: PreviewTarget, soundId: number): OriginalSound | null => {
  const key = keyOf(target, soundId);
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const rendered = renderOriginalSound(target, soundId, PREVIEW_SECONDS[target]);
  if (rendered === null) return null;

  const frames = audibleLength(rendered.samples);
  const sound: OriginalSound = {
    buffer: toAudioBuffer(rendered.samples, rendered.sampleRate, frames),
    audible: frames > 0,
  };
  if (frames <= CACHEABLE_SECONDS * rendered.sampleRate) cache.set(key, sound);
  return sound;
};

/** Stop whatever original is sounding. Safe to call when nothing is. */
const stopOriginalSound = (): void => {
  if (playing === null) return;
  const source = playing;
  playing = null;
  source.onended = null;
  source.stop();
};

interface PlayOutcome {
  /** False when there was nothing to play, either no core or an id the chip is silent on. */
  started: boolean;
  /** Set when the id renders but produces no sound, which is worth saying out loud. */
  silent: boolean;
}

/**
 * Play the chip's version of one sound, replacing any original already sounding. `onEnded` fires
 * when it finishes on its own. Async only because the first call may have to load a core.
 */
const playOriginalSound = async (
  target: PreviewTarget,
  soundId: number,
  onEnded?: () => void,
): Promise<PlayOutcome> => {
  stopOriginalSound();
  if (await ensurePreviewModule() === null) return { started: false, silent: false };
  const sound = loadOriginalSound(target, soundId);
  if (sound === null) return { started: false, silent: false };
  if (!sound.audible) return { started: false, silent: true };

  const ctx = audioContext();
  void ctx.resume();
  const source = ctx.createBufferSource();
  source.buffer = sound.buffer;
  source.loop = CONTINUOUS.includes(target);
  source.connect(ctx.destination);
  source.onended = () => {
    // Only clear when this source is still the current one: a newer press already replaced it.
    if (playing === source) playing = null;
    onEnded?.();
  };
  playing = source;
  source.start();
  return { started: true, silent: false };
};

/** Long enough to tell a sound from silence without paying for the full window; a scan runs this for every id on a channel. */
const PROBE_SECONDS = 2;

/**
 * Which of `ids` the chip makes a sound for (most channels carry unused ids). Empty when the
 * core cannot render at all, which the caller distinguishes with `canPreviewOriginals`.
 */
const probeAudibleIds = async (target: PreviewTarget, ids: number[]): Promise<Set<number>> => {
  const audible = new Set<number>();
  if (await ensurePreviewModule() === null) return audible;
  for (const id of ids) {
    // A cached full render already answers this; only the uncached ids need a probe.
    const cached = cache.get(keyOf(target, id));
    if (cached !== undefined) {
      if (cached.audible) audible.add(id);
      continue;
    }
    const rendered = renderOriginalSound(target, id, PROBE_SECONDS);
    if (rendered === null) return audible;
    if (audibleLength(rendered.samples) > 0) audible.add(id);
  }
  return audible;
};

export {
  canPreviewOriginals, playOriginalSound, stopOriginalSound, probeAudibleIds,
  PREVIEW_SECONDS, PROBE_SECONDS,
};
export type { OriginalSound, PlayOutcome, PreviewTarget };
