/* @layer renderer-components @kind logic */
import type { SoundChannel } from '@rotp/game-data';
import { SOUND_CHANNELS } from '@app/lib/msu/sound-claim';

const channelIndexOf = (channel: SoundChannel): number => SOUND_CHANNELS.indexOf(channel);

export { channelIndexOf };
