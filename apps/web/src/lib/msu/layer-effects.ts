/* @layer renderer-lib @kind logic */
/**
 * Builds a layer's effects as a chain of audio nodes, in the order the layer lists them.
 *
 * Every effect is one or more biquad filters, because that is the whole vocabulary the manifest
 * allows: a description that plays the same everywhere and can be flattened into an export. The
 * three-band EQ is three filters in a row (a low shelf, a peak in the middle, a high shelf) at
 * fixed corner frequencies, so the three numbers in the manifest are all there is to it.
 *
 * An empty chain is no nodes at all, so a layer without effects costs nothing it did not before.
 */
import type { LayerEffect } from '@shared/types/msu-manifest';

interface EffectChain {
  /** Where the layer's audio goes in; equals `output` when the chain is empty. */
  input: AudioNode;
  /** What connects onward to the channel. */
  output: AudioNode;
  dispose: () => void;
}

/** Corner frequencies of the three EQ bands, the shelf knees and the peak's centre. */
const EQ_LOW_HZ = 250;
const EQ_MID_HZ = 1000;
const EQ_HIGH_HZ = 4000;
/** Width of the mid peak; about an octave and a half, broad enough to read as "presence". */
const EQ_MID_Q = 0.7;

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

/** Wire `effects` into a chain ending at `destination`. */
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

export { buildEffectChain, EQ_LOW_HZ, EQ_MID_HZ, EQ_HIGH_HZ };
export type { EffectChain };
