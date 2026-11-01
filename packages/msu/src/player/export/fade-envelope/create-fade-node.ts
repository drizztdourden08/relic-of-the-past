/* @layer renderer-lib @kind logic */
import { scheduleEnvelope } from '../../voice-parts/schedule-envelope';
import type { FadeEnvelope } from './fade-envelope.type';

const createFadeNode = (ctx: BaseAudioContext, destination: AudioNode,
  startedAt: number, fade: FadeEnvelope): GainNode => {
  const node = ctx.createGain();
  node.connect(destination);
  scheduleEnvelope(node.gain, startedAt, fade);
  return node;
};

export { createFadeNode };
