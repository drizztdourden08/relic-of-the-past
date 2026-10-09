/* @layer renderer-components @kind logic */
import type { SoundChannel } from '@shared/types/msu-manifest';

const isAdditiveChannel = (channel: SoundChannel): boolean => channel !== 'ambient';

export { isAdditiveChannel };
