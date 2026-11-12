/* @layer website-site @kind logic */
import { isReady } from './is-ready';
import type { Degrader } from './ready-visual.type';

const degradeSingle: Degrader<'single'> = (visual) => (isReady(visual.shot) ? visual : null);

export { degradeSingle };
