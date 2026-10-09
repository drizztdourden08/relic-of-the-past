/* @layer renderer-lib @kind logic */
import { createAdditiveChannel } from '../channels/additive-channel';
import { createStatefulChannel } from '../channels/stateful-channel';
import type { ChannelOptions, SoundChannelApi } from '../channels/channel.type';

const createSoundChannel = (options: ChannelOptions): SoundChannelApi =>
  options.kind === 'additive' ? createAdditiveChannel(options) : createStatefulChannel(options);

export { createSoundChannel };
