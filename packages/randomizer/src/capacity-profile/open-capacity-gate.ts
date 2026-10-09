/* @layer bridge-wasm @kind logic */
import { setCapacityProfileActive, reassertGateWord3 } from '@rotp/game-core';

const openCapacityGate = (): void => {
  setCapacityProfileActive(true);
  reassertGateWord3();
};

export { openCapacityGate };
