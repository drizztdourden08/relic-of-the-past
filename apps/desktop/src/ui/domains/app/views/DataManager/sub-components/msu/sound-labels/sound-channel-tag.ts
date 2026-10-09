/* @layer renderer-components @kind logic */
import type { SoundChannel } from '@shared/types/msu-manifest';
import { SOUND_CHANNEL_TAGS } from './sound-labels.constants';

const soundChannelTag = (channel: SoundChannel): string => SOUND_CHANNEL_TAGS[channel];

export { soundChannelTag };
