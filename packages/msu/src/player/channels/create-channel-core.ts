/* @layer renderer-lib @kind logic */
import { createTrackLoader } from '../track-loader';
import type { ChannelCore, ChannelOptions } from './channel.type';

const createChannelCore = (options: ChannelOptions): ChannelCore => {
  const { ctx, destination, programs, loadBytes, cacheLimit, onError } = options;

  const fadeGain = ctx.createGain();
  fadeGain.connect(destination);

  const loader = createTrackLoader(ctx, loadBytes, onError, cacheLimit);
  const byId = new Map(programs.map((program) => [program.id, program]));
  const teardown = (): void => {
    loader.clear();
    fadeGain.disconnect();
  };

  return { fadeGain, loader, byId, teardown };
};

export { createChannelCore };
