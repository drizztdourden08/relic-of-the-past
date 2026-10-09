/* @layer renderer-components @kind logic */
import type { SoundChannel } from '@shared/types/msu-manifest';
import { SOUND_CHANNEL_PORTS } from '@rotp/game-data';
import { SOUND_CHANNEL_LABELS } from '@domains/packs/music/behavior/sound-names';

const soundChannelPort = (channel: SoundChannel): string =>
  `${SOUND_CHANNEL_LABELS[channel]} · port ${SOUND_CHANNEL_PORTS[channel]}`;

export { soundChannelPort };
