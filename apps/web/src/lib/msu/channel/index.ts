/* @layer renderer-lib @kind barrel */
export { createSoundChannel } from './create-sound-channel';
export { MAX_LIVE_TRIGGERS } from '../channels/additive-channel.constants';
export type {
  MsuChannelName, ChannelKind, ChannelOptions, ChannelReport, ChannelResume,
  LayerReport, SoundChannelApi, SoundProgram,
} from '../channels/channel.type';
