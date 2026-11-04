/* @layer bridge-wasm @kind logic */
import { stopMsuSession as stop } from '@rotp/msu';
import { detachHooks } from './attach-hooks';

const stopMsuSession = (): void => {
  stop();
  detachHooks();
};

export { stopMsuSession };
