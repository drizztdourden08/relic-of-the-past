/* @layer renderer-components @kind constants */
import type { SoundChannel } from '@shared/types/msu-manifest';
import { SOUND_CHANNEL_TAGS } from '../sound-labels';

const PORT_TAGS: [SoundChannel, string][] = [
  ['sfx1', SOUND_CHANNEL_TAGS.sfx1.toLowerCase()],
  ['sfx2', SOUND_CHANNEL_TAGS.sfx2.toLowerCase()],
];

export { PORT_TAGS };
