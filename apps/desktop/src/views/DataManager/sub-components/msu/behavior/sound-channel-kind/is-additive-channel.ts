/* @layer renderer-components @kind logic */
import type { SoundChannel } from '@rotp/game-data';

const isAdditiveChannel = (channel: SoundChannel): boolean => channel !== 'ambient';

export { isAdditiveChannel };
