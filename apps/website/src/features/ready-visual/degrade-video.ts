/* @layer website-site @kind logic */
import { isReady } from './is-ready';
import type { Degrader } from './ready-visual.type';

const degradeVideo: Degrader<'video'> = (visual) => (isReady(visual.video.poster) ? visual : null);

export { degradeVideo };
