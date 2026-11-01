/* @layer renderer-lib @kind logic */
import type { DecodedAudio } from './decode/decode-audio-file';
import type { Voice, VoiceOptions } from './voice.type';
import { createFadePlan } from './voice-parts/create-fade-plan';
import { fadeAt } from './voice-parts/fade-at';
import { loopStartOf } from './voice-parts/loop-start-of';
import { playbackOffset } from './voice-parts/playback-offset';
import { scheduleEnvelope } from './voice-parts/schedule-envelope';
import { wireSource } from './voice-parts/wire-source';

const stopIfPlaying = (source: AudioBufferSourceNode): void => {
  try { source.stop(); } catch { return undefined; }
};

const createVoice = (ctx: BaseAudioContext, destination: AudioNode, decoded: DecodedAudio, options: VoiceOptions): Voice => {
  const { loop, offsetSeconds: startOffset = 0, onEnded, loopSecondsOverride } = options;
  const { buffer } = decoded;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const loopStart = loopStartOf(decoded, loopSecondsOverride);

  if (loop) {
    source.loop = true;
    source.loopStart = loopStart;
    source.loopEnd = buffer.duration;
  }
  if (onEnded) source.onended = onEnded;

  const envelope = wireSource(ctx, source, destination, options);

  const startedAt = ctx.currentTime;
  if (envelope) scheduleEnvelope(envelope.gain, startedAt, options);

  source.start(0, Math.min(startOffset, buffer.duration));

  let stopped = false;

  const offsetSeconds = (): number =>
    playbackOffset(startOffset + (ctx.currentTime - startedAt), loop, { duration: buffer.duration, loopStart });

  const plan = createFadePlan(startedAt, options);
  const fade = () => (stopped ? null : fadeAt(plan, ctx.currentTime));

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
