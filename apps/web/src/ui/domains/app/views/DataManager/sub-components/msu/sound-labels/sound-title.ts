/* @layer renderer-components @kind logic */
import type { SoundChannel } from '@shared/types/msu-manifest';
import { SOUND_CHANNEL_LABELS, soundHexId } from '@domains/packs/music/behavior/sound-names';

const soundTitle = (channel: SoundChannel, soundId: number): string =>
  `${SOUND_CHANNEL_LABELS[channel]} ${soundHexId(soundId)}`;

export { soundTitle };
