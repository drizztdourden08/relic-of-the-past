/* @layer bridge-wasm @kind logic */
import { setCapacityProfileActive } from '../live-settings-flags';
import { reassertGateWord3 } from '../live-settings';

const openCapacityGate = (): void => {
  setCapacityProfileActive(true);
  reassertGateWord3();
};

export { openCapacityGate };
