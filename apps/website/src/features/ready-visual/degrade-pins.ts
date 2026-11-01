/* @layer website-site @kind logic */
import { isReady } from './is-ready';
import type { Degrader } from './ready-visual.type';

const degradePins: Degrader<'pins'> = (visual) => (isReady(visual.shot) ? visual : null);

export { degradePins };
