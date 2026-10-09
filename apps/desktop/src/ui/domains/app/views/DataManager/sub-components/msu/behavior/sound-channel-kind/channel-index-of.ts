/* @layer renderer-components @kind logic */
import type { SoundChannel } from '@rotp/game-data';
import { SOUND_CHANNELS } from '@rotp/msu';

const channelIndexOf = (channel: SoundChannel): number => SOUND_CHANNELS.indexOf(channel);

export { channelIndexOf };
