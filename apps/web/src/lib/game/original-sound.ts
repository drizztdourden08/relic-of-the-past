/* @layer bridge-wasm @kind logic */
/**
 * Plays the sound chip's own version of a sound, for comparing against a replacement.
 *
 * Deliberately simple next to the pack engine: an original is one buffer with no layers, no
 * schedule and no volume shaping, so the comparison is against the sound as the chip makes it
 * rather than against a processed version of it. Only one plays at a time — the point is A/B, and
 * two originals at once would defeat it.
 *
 * Short renders are cached because they are deterministic: the same id on the same assets always
 * produces the same samples, so re-rendering a one-shot on every press would be wasted work. The
 * long ones are deliberately NOT cached — a minute of float32 stereo is about 15 MB, and holding one
 * per music slot would cost hundreds of megabytes to save a render that takes a tenth of a second.
 */
import { canPreviewOriginals, renderOriginalSound } from './bridge/sound-preview';
import type { PreviewTarget } from './bridge/sound-preview';
import { ensurePreviewModule } from './preview-core';

/**
 * How much of each target to render.
 *
 * A one-shot is trimmed to its own length afterwards, so its figure only has to exceed the longest
 * effect in the game — the fanfares — and anything past that costs nothing. Music and an ambient bed
 * never end, so for those the figure IS the preview length, and it has to be long enough to compare
 * against a replacement: the pack tracks here run about a minute, so a preview that stopped at eight
 * seconds cut off in the middle of the first phrase.
 */
const PREVIEW_SECONDS: Record<PreviewTarget, number> = {
  music: 60,
  ambient: 30,
  sfx1: 10,
  sfx2: 10,
};

/** Below this a sample counts as silence when trimming a one-shot's tail. */
const SILENCE_FLOOR = 24;

/** Renders longer than this are re-made on demand rather than kept — see the note above. */
const CACHEABLE_SECONDS = 12;

/**
 * The targets the chip plays until told to stop. Their preview loops for the same reason: the window
 * is only as long as it is because a render has to end somewhere, and stopping at the edge of it
 * reads as the sound being cut off. Looping says what is true — this one keeps going.
 */
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

/**
 * Where the sound actually ends. A one-shot occupies a fraction of the render window and the rest is
 * digital silence, so trimming is what stops a half-second bonk from holding the "playing" state for
 * the whole window. Music and beds fill their window and come back whole.
 */
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
  /** False when there was nothing to play — no core, or an id the chip is silent on. */
  started: boolean;
  /** Set when the id renders but produces no sound, which is worth saying out loud. */
  silent: boolean;
}

/**
 * Play the chip's version of one sound, replacing any original already sounding. `onEnded` fires
 * when it finishes on its own, so a caller's "playing" state can clear itself.
 *
 * Async only because the very first call may have to load a core to read the assets from; every
 * call after that resolves immediately.
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

/**
 * Long enough to tell a sound from silence without paying for the full window: a scan runs this for
 * every id on a channel, and an id that makes any sound at all starts making it immediately.
 */
const PROBE_SECONDS = 2;

/**
 * Which of `ids` the chip actually makes a sound for. Most channels carry a run of ids the game
 * never uses, and a list that cannot say which those are leaves someone auditioning silence and
 * wondering what broke. Returns an empty set when the core cannot render at all, which the caller
 * distinguishes with `canPreviewOriginals`.
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
