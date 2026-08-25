/* @layer renderer-lib @kind logic */
/**
 * One replaceable sound-chip channel, in the only two behaviors the game needs.
 *
 * The engine holds four of these and never asks which is which: music and the ambient bed are
 * `stateful` (a new id replaces the old and has a position worth resuming), the two effect
 * channels are `additive` (a new id layers over what is already sounding, and nothing resumes).
 * That single distinction is what used to be spread through the engine as "the active track".
 */
import { createAdditiveChannel } from './channels/additive-channel';
import { createStatefulChannel } from './channels/stateful-channel';
import type { ChannelOptions, SoundChannelApi } from './channels/channel.type';

const createSoundChannel = (options: ChannelOptions): SoundChannelApi =>
  options.kind === 'additive' ? createAdditiveChannel(options) : createStatefulChannel(options);

export { createSoundChannel };
export { MAX_LIVE_TRIGGERS } from './channels/additive-channel';
export type {
  MsuChannelName, ChannelKind, ChannelOptions, ChannelReport, ChannelResume,
  LayerReport, SoundChannelApi, SoundProgram,
} from './channels/channel.type';
