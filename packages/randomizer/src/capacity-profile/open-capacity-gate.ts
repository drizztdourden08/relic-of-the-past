/* @layer bridge-wasm @kind logic */
import { setCapacityProfileActive } from '@rotp/game-core';
import { reassertGateWord3 } from '@rotp/game-core';

const openCapacityGate = (): void => {
  setCapacityProfileActive(true);
  reassertGateWord3();
};

export { openCapacityGate };
