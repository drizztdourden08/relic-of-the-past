/* @layer renderer-components @kind logic */
// Channel index and additivity, taken from the engine so the previewer cannot number a channel differently.
import type { SoundChannel } from '@shared/types/msu-manifest';
import { SOUND_CHANNELS } from '@app/lib/msu/sound-claim';

/** The index `onGameSound` takes: 0 ambient, 1 sfx1, 2 sfx2. */
const channelIndexOf = (channel: SoundChannel): number => SOUND_CHANNELS.indexOf(channel);

/** True for the effect channels, where each trigger layers over whatever is still sounding. */
const isAdditiveChannel = (channel: SoundChannel): boolean => channel !== 'ambient';

export { channelIndexOf, isAdditiveChannel };
