/* @layer renderer-lib @kind logic */
import type { VoiceOptions } from '../voice.type';

const needsEnvelope = (options: VoiceOptions): boolean => {
  const { fadeInSeconds = 0, fadeOutAfterSeconds, fadeOutSeconds = 0 } = options;
  return fadeInSeconds > 0 || (fadeOutAfterSeconds !== undefined && fadeOutSeconds > 0);
};

const wireSource = (
  ctx: BaseAudioContext, source: AudioBufferSourceNode, destination: AudioNode, options: VoiceOptions,
): GainNode | null => {
  const envelope = needsEnvelope(options) ? ctx.createGain() : null;
  if (envelope) {
    envelope.connect(destination);
    source.connect(envelope);
  } else {
    source.connect(destination);
  }
  return envelope;
};

export { wireSource };
