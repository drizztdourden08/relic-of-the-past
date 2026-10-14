/* @layer renderer-lib @kind logic */
import { createFadeNode, hasFade } from '../fade-envelope';
import type { SourceTiming } from './place-source.type';

const startSource = (ctx: BaseAudioContext, destination: AudioNode, buffer: AudioBuffer,
  timing: SourceTiming): void => {
  const { when, offsetSeconds = 0, fade } = timing;
  const at = Math.max(0, when);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(fade && hasFade(fade) ? createFadeNode(ctx, destination, at, fade) : destination);
  source.start(at, Math.max(0, Math.min(offsetSeconds, buffer.duration)));
};

export { startSource };
