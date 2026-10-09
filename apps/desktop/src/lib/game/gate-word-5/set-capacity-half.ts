/* @layer bridge-wasm @kind logic */
import { gateWord5State } from './gate-word-5-state';
import { writeGateWord5 } from './write-gate-word-5';

const setCapacityHalf = (bits: number): void => {
  gateWord5State.capacityHalf = bits;
  writeGateWord5();
};

export { setCapacityHalf };
