/* @layer renderer-stores @kind logic */
import type { SimProgress } from './simulator-store.type';

const emptyProgress = (): SimProgress => ({
  phase: 'idle',
  checksDone: 0,
  discovered: 0,
  epoch: 0,
  currentScreen: '',
});

export { emptyProgress };
