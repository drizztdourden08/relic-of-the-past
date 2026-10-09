/* @layer renderer-lib @kind logic */
import type { LayerEffect } from '@shared/types/msu-manifest';
import type { EffectChain } from './layer-effects.type';
import { EQ_HIGH_HZ, EQ_LOW_HZ, EQ_MID_HZ, EQ_MID_Q } from './layer-effects.constants';

const biquad = (
  ctx: BaseAudioContext, type: BiquadFilterType, frequency: number, gainDb = 0, q?: number,
): BiquadFilterNode => {
  const node = ctx.createBiquadFilter();
  node.type = type;
  node.frequency.value = frequency;
  node.gain.value = gainDb;
  if (q !== undefined) node.Q.value = q;
  return node;
};

const nodesFor = (ctx: BaseAudioContext, effect: LayerEffect): BiquadFilterNode[] => {
  switch (effect.kind) {
    case 'lowpass': return [biquad(ctx, 'lowpass', effect.frequencyHz)];
    case 'highpass': return [biquad(ctx, 'highpass', effect.frequencyHz)];
    case 'eq': return [
      biquad(ctx, 'lowshelf', EQ_LOW_HZ, effect.lowDb),
      biquad(ctx, 'peaking', EQ_MID_HZ, effect.midDb, EQ_MID_Q),
      biquad(ctx, 'highshelf', EQ_HIGH_HZ, effect.highDb),
    ];
  }
};

const buildEffectChain = (
  ctx: BaseAudioContext, destination: AudioNode, effects: LayerEffect[] | undefined,
): EffectChain => {
  const nodes = (effects ?? []).flatMap((effect) => nodesFor(ctx, effect));
  if (nodes.length === 0) return { input: destination, output: destination, dispose: () => {} };
  nodes.forEach((node, index) => node.connect(index + 1 < nodes.length ? nodes[index + 1] : destination));
  return {
    input: nodes[0],
    output: nodes[nodes.length - 1],
    dispose: () => { for (const node of nodes) node.disconnect(); },
  };
};

export { buildEffectChain };
