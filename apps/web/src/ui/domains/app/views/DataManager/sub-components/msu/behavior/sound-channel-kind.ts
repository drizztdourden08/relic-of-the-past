/* @layer renderer-components @kind logic */
/**
 * The two facts the studio needs about a channel: which index the core reports it by, and
 * whether a second trigger replaces the first or piles on top of it.
 *
 * Both come from the engine rather than being restated here, so a channel added to the mask
 * cannot end up numbered differently in the previewer than in the game.
 */
import type { SoundChannel } from '@shared/types/msu-manifest';
import { SOUND_CHANNELS } from '@app/lib/msu/sound-claim';

/** The index `onGameSound` takes: 0 ambient, 1 sfx1, 2 sfx2. */
const channelIndexOf = (channel: SoundChannel): number => SOUND_CHANNELS.indexOf(channel);

/**
 * True for the effect channels, where each trigger layers over whatever is still sounding —
 * so pressing play repeatedly is meant to be heard as several sounds at once, not as a restart.
 */
const isAdditiveChannel = (channel: SoundChannel): boolean => channel !== 'ambient';

export { channelIndexOf, isAdditiveChannel };
