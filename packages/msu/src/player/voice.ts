/* @layer renderer-lib @kind logic */
import type { DecodedAudio } from './decode/decode-audio-file';
import type { Voice, VoiceFade, VoiceOptions } from './voice.type';

const scheduleEnvelope = (gain: AudioParam, startedAt: number, options: VoiceOptions): void => {
  const { fadeInSeconds = 0, fadeOutAfterSeconds, fadeOutSeconds = 0 } = options;
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
};

const stopIfPlaying = (source: AudioBufferSourceNode): void => {
  try { source.stop(); } catch {  }
};

const createVoice = (ctx: BaseAudioContext, destination: AudioNode, decoded: DecodedAudio, options: VoiceOptions): Voice => {
  const {
    loop, offsetSeconds: startOffset = 0, onEnded,
    fadeInSeconds = 0, fadeOutAfterSeconds, fadeOutSeconds = 0, loopSecondsOverride,
  } = options;
  const { buffer, loopSample } = decoded;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
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
  if (envelope) scheduleEnvelope(envelope.gain, startedAt, options);

  source.start(0, Math.min(startOffset, buffer.duration));

  let stopped = false;

  const offsetSeconds = (): number => {
    const elapsed = startOffset + (ctx.currentTime - startedAt);
    if (!loop || elapsed < buffer.duration) return Math.min(elapsed, buffer.duration);
    const loopLength = buffer.duration - loopStart;
    if (loopLength <= 0) return loopStart;
    return loopStart + ((elapsed - buffer.duration) % loopLength);
  };

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
    stopIfPlaying(source);
    source.disconnect();
    envelope?.disconnect();
  };

  return { stop, offsetSeconds, durationSeconds: buffer.duration, loopSeconds: loop ? loopStart : null, fade };
};

export { createVoice };
export type { Voice, VoiceOptions, VoiceFade } from './voice.type';
