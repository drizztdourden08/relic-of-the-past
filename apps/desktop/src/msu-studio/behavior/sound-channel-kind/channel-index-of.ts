/* @layer renderer-components @kind logic */
import type { SoundChannel } from '@rotp/game-data';
import { alttpMsuConfig } from '@rotp/msu';

const channelIndexOf = (channel: SoundChannel): number =>
  alttpMsuConfig.soundChannels.find((entry) => entry.name === channel)?.coreIndex ?? -1;

export { channelIndexOf };
