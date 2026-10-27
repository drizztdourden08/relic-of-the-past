/* @layer website-site @kind logic */
import { isReady } from './is-ready';
import type { Degrader } from './ready-visual.type';

const degradeAudio: Degrader<'audio'> = (visual) => (isReady(visual.shot) ? visual : null);

export { degradeAudio };
