/* @layer bridge-wasm @kind logic */
import { setCapacityProfileActive } from '@rotp/game-core';
import { reassertGateWord3 } from '../live-settings';

const openCapacityGate = (): void => {
  setCapacityProfileActive(true);
  reassertGateWord3();
};

export { openCapacityGate };
