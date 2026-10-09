/* @layer renderer-components @kind logic */
import type { SoundChannel } from '@rotp/game-data';
import { SOUND_CHANNEL_PORTS } from '@rotp/game-data';
import { SOUND_CHANNEL_LABELS } from '@rotp/design/packs';

const soundChannelPort = (channel: SoundChannel): string =>
  `${SOUND_CHANNEL_LABELS[channel]} · port ${SOUND_CHANNEL_PORTS[channel]}`;

export { soundChannelPort };
