/* @layer bridge-wasm @kind logic */
import { stopActiveSession } from '@drizztdourden08/brock-randomizer/renderer';
import { installBridge } from './install-bridge';

const stopActive = (): void => {
  installBridge();
  stopActiveSession();
};

export { stopActive };
