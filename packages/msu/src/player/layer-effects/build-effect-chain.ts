/* @layer renderer-lib @kind logic */
import type { LayerEffect } from '@rotp/game-data';
import type { BiquadSpec, EffectChain } from './layer-effects.type';
import { EQ_HIGH_HZ, EQ_LOW_HZ, EQ_MID_HZ, EQ_MID_Q } from './layer-effects.constants';

const biquad = (ctx: BaseAudioContext, spec: BiquadSpec): BiquadFilterNode => {
  const { type, frequency, gainDb = 0, q } = spec;
  const node = ctx.createBiquadFilter();
  node.type = type;
  node.frequency.value = frequency;
  node.gain.value = gainDb;
  if (q !== undefined) node.Q.value = q;
  return node;
};

const nodesFor = (ctx: BaseAudioContext, effect: LayerEffect): BiquadFilterNode[] => {
  switch (effect.kind) {
    case 'lowpass': return [biquad(ctx, { type: 'lowpass', frequency: effect.frequencyHz })];
    case 'highpass': return [biquad(ctx, { type: 'highpass', frequency: effect.frequencyHz })];
    case 'eq': return [
      biquad(ctx, { type: 'lowshelf', frequency: EQ_LOW_HZ, gainDb: effect.lowDb }),
      biquad(ctx, { type: 'peaking', frequency: EQ_MID_HZ, gainDb: effect.midDb, q: EQ_MID_Q }),
      biquad(ctx, { type: 'highshelf', frequency: EQ_HIGH_HZ, gainDb: effect.highDb }),
    ];
  }
};

const buildEffectChain = (
  ctx: BaseAudioContext, destination: AudioNode, effects: LayerEffect[] | undefined,
): EffectChain => {
  const nodes = (effects ?? []).flatMap((effect) => nodesFor(ctx, effect));
  const [first] = nodes;
  const last = nodes.at(-1);
  if (first === undefined || last === undefined) return { input: destination, output: destination, dispose: () => {} };
  nodes.forEach((node, index) => node.connect(nodes[index + 1] ?? destination));
  return {
    input: first,
    output: last,
    dispose: () => { for (const node of nodes) node.disconnect(); },
  };
};

export { buildEffectChain };
