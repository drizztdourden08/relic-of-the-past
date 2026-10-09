/* @layer bridge-wasm @kind logic */
import { queueState } from './queue-state';

const size = (): number => queueState.queue.length;

export { size };
