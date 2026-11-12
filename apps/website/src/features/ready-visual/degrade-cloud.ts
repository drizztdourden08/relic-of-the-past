/* @layer website-site @kind logic */
import type { Degrader } from './ready-visual.type';

const degradeCloud: Degrader<'cloud'> = (visual) => visual;

export { degradeCloud };
