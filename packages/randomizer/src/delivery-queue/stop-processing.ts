/* @layer bridge-wasm @kind logic */
import { sharedEngine } from './shared-engine';

const stopProcessing = (): void => {
  sharedEngine.stop();
};

export { stopProcessing };
