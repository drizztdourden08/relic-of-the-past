/* @layer renderer-components @kind logic */
import type { SoundChannel } from '@rotp/game-data';
import { SOUND_CHANNEL_LABELS, soundHexId } from '@rotp/design/packs';

const soundTitle = (channel: SoundChannel, soundId: number): string =>
  `${SOUND_CHANNEL_LABELS[channel]} ${soundHexId(soundId)}`;

export { soundTitle };
