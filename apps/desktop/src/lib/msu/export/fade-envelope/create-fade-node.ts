/* @layer renderer-lib @kind logic */
import type { FadeEnvelope } from './fade-envelope.type';

const createFadeNode = (ctx: BaseAudioContext, destination: AudioNode,
  startedAt: number, fade: FadeEnvelope): GainNode => {
  const { fadeInSeconds = 0, fadeOutAfterSeconds, fadeOutSeconds = 0 } = fade;
  const node = ctx.createGain();
  node.connect(destination);
  const { gain } = node;

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

  return node;
};

export { createFadeNode };
