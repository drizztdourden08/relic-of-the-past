/* @layer renderer-lib @kind logic */
/**
 * One sounding buffer. Wraps an AudioBufferSourceNode and can report how far
 * into the audio it currently is. That read is what makes resume possible, since Web Audio
 * exposes no playback position of its own.
 *
 * A voice asked to fade gets its own gain node, so two passes of a loop can overlap and move
 * in opposite directions at the same time without touching the layer's own volume.
 */
import type { DecodedAudio } from './decode/decode-audio-file';

interface VoiceOptions {
  loop: boolean;
  /** Where in the buffer to begin, in seconds. */
  offsetSeconds?: number;
  onEnded?: () => void;
  /** Rise from silence to full over this many seconds. */
  fadeInSeconds?: number;
  /** Fall to silence over `fadeOutSeconds`, starting this many seconds from now. */
  fadeOutAfterSeconds?: number;
  fadeOutSeconds?: number;
  /**
   * Loop restart point in SECONDS, overriding whatever the file declared. This is what gives a
   * `.wav` or `.mp3` layer the intro-then-loop structure only MSU-1 `.pcm` can carry in its own
   * header: the point lives in the manifest instead of the file. Undefined defers to the file.
   *
   * Seconds, not samples, on purpose. A manifest loop point is defined at 44100 Hz whatever
   * the file's own rate is, while a `.pcm` header's is in that file's rate, so carrying both as
   * "samples" invites converting one against the wrong rate. The caller converts; this just uses it.
   */
  loopSecondsOverride?: number;
}

/** Where a voice is in its fade envelope, so a preview can show a crossfade as it happens. */
interface VoiceFade {
  kind: 'in' | 'out';
  /** Seconds left in this fade. */
  remainingSeconds: number;
  /** How long the fade lasts in total, for a progress reading. */
  totalSeconds: number;
}

interface Voice {
  stop: () => void;
  /** Current position in the buffer, in seconds, accounting for loop wrap-around. */
  offsetSeconds: () => number;
  /** Length of the audio this voice is playing. */
  durationSeconds: number;
  /**
   * Where playback returns to when it reaches the end, or null when it does not loop. An MSU-1 file
   * carries this in its header, and it is normally NOT zero: the track has an intro that plays once
   * and a body that repeats, so position jumping backwards to here is the file working as authored.
   */
  loopSeconds: number | null;
  /** The fade currently under way, or null when the voice is at steady volume. */
  fade: () => VoiceFade | null;
}

const createVoice = (ctx: BaseAudioContext, destination: AudioNode, decoded: DecodedAudio, options: VoiceOptions): Voice => {
  const {
    loop, offsetSeconds: startOffset = 0, onEnded,
    fadeInSeconds = 0, fadeOutAfterSeconds, fadeOutSeconds = 0, loopSecondsOverride,
  } = options;
  const { buffer, loopSample } = decoded;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  // The manifest wins over the file: an author who set a loop point in the studio meant it, and for
  // every format except MSU-1 `.pcm` the file has nowhere to state one at all.
  const loopStart = Math.min(
    loopSecondsOverride ?? (loopSample > 0 ? loopSample / buffer.sampleRate : 0),
    buffer.duration,
  );

  if (loop) {
    source.loop = true;
    source.loopStart = loopStart;
    source.loopEnd = buffer.duration;
  }
  if (onEnded) source.onended = onEnded;

  const fades = fadeInSeconds > 0 || (fadeOutAfterSeconds !== undefined && fadeOutSeconds > 0);
  const envelope = fades ? ctx.createGain() : null;
  if (envelope) {
    envelope.connect(destination);
    source.connect(envelope);
  } else {
    source.connect(destination);
  }

  const startedAt = ctx.currentTime;
  if (envelope) {
    const gain = envelope.gain;
    if (fadeInSeconds > 0) {
      gain.setValueAtTime(0, startedAt);
      gain.linearRampToValueAtTime(1, startedAt + fadeInSeconds);
    } else {
      gain.setValueAtTime(1, startedAt);
    }
    if (fadeOutAfterSeconds !== undefined && fadeOutSeconds > 0) {
      const outAt = startedAt + Math.max(fadeInSeconds, fadeOutAfterSeconds);
      gain.setValueAtTime(1, outAt);
      gain.linearRampToValueAtTime(0, outAt + fadeOutSeconds);
    }
  }

  source.start(0, Math.min(startOffset, buffer.duration));

  let stopped = false;

  const offsetSeconds = (): number => {
    const elapsed = startOffset + (ctx.currentTime - startedAt);
    if (!loop || elapsed < buffer.duration) return Math.min(elapsed, buffer.duration);
    // Past the first pass, playback cycles through [loopStart, duration).
    const loopLength = buffer.duration - loopStart;
    if (loopLength <= 0) return loopStart;
    return loopStart + ((elapsed - buffer.duration) % loopLength);
  };

  // Same instants the envelope above was scheduled at, kept so the fade can be reported.
  const fadeOutStart = fadeOutAfterSeconds === undefined
    ? null
    : startedAt + Math.max(fadeInSeconds, fadeOutAfterSeconds);

  const fade = (): VoiceFade | null => {
    if (stopped) return null;
    const now = ctx.currentTime;
    if (fadeInSeconds > 0 && now < startedAt + fadeInSeconds) {
      return { kind: 'in', remainingSeconds: startedAt + fadeInSeconds - now, totalSeconds: fadeInSeconds };
    }
    if (fadeOutStart !== null && fadeOutSeconds > 0 && now >= fadeOutStart && now < fadeOutStart + fadeOutSeconds) {
      return { kind: 'out', remainingSeconds: fadeOutStart + fadeOutSeconds - now, totalSeconds: fadeOutSeconds };
    }
    return null;
  };

  const stop = (): void => {
    if (stopped) return;
    stopped = true;
    source.onended = null;
    try { source.stop(); } catch { /* already ended */ }
    source.disconnect();
    envelope?.disconnect();
  };

  return { stop, offsetSeconds, durationSeconds: buffer.duration, loopSeconds: loop ? loopStart : null, fade };
};

export { createVoice };
export type { Voice, VoiceOptions, VoiceFade };
