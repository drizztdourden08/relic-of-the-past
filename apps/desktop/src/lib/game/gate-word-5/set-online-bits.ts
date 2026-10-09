/* @layer bridge-wasm @kind logic */
import { AP_DEATH_LINK_BIT, AP_ONLINE_BIT } from './gate-word-5.constants';
import { gateWord5State } from './gate-word-5-state';
import { writeGateWord5 } from './write-gate-word-5';

const setOnlineBits = (bits: number): void => {
  gateWord5State.onlineBits = bits & (AP_ONLINE_BIT | AP_DEATH_LINK_BIT);
  writeGateWord5();
};

export { setOnlineBits };
