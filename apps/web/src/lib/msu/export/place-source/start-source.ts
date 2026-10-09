/* @layer renderer-lib @kind logic */
import type { FadeEnvelope } from '../fade-envelope';
import { createFadeNode, hasFade } from '../fade-envelope';

const startSource = (ctx: BaseAudioContext, destination: AudioNode, buffer: AudioBuffer,
  when: number, offsetSeconds = 0, fade?: FadeEnvelope): void => {
  const at = Math.max(0, when);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(fade && hasFade(fade) ? createFadeNode(ctx, destination, at, fade) : destination);
  source.start(at, Math.max(0, Math.min(offsetSeconds, buffer.duration)));
};

export { startSource };
