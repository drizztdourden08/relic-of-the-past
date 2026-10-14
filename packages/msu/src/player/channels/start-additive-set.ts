/* @layer renderer-lib @kind logic */
import { startLayers } from './active-layers';
import { PAN_LEFT, PAN_RIGHT } from './additive-channel.constants';
import type { LiveSet, StartSetParams } from './additive-channel.type';

const panTo = (ctx: BaseAudioContext, destination: AudioNode, pan: number): AudioNode => {
  if (pan !== PAN_LEFT && pan !== PAN_RIGHT) return destination;
  if (typeof ctx.createStereoPanner !== 'function') return destination;
  const panner = ctx.createStereoPanner();
  panner.pan.value = pan === PAN_LEFT ? -1 : 1;
  panner.connect(destination);
  return panner;
};

const startAdditiveSet = (params: StartSetParams): LiveSet => {
  const { ctx, fadeGain, name, program, loaded, pool, pan } = params;
  const out = panTo(ctx, fadeGain, pan);
  const startedAt = ctx.currentTime;
  const layers = startLayers({
    ctx,
    channel: name,
    destination: out,
    program,
    loaded,
    elapsedSeconds: () => ctx.currentTime - startedAt,
    resumeFor: (layer, fileCount) => pool.pick(layer, fileCount),
  });
  return { id: program.id, startedAt, layers, out };
};

export { startAdditiveSet };
