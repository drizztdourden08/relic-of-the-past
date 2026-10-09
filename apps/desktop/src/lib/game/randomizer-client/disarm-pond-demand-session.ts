/* @layer bridge-wasm @kind logic */
import { clearPondDemands } from '../pond-demands';

const disarmPondDemandSession = (): void => {
  clearPondDemands();
};

export { disarmPondDemandSession };
