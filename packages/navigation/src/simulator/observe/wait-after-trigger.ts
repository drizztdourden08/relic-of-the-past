/* @layer bridge-wasm @kind logic */
import { nextFrame } from './next-frame';

const waitAfterTrigger = async (): Promise<void> => { await nextFrame(); await nextFrame(); };

export { waitAfterTrigger };
