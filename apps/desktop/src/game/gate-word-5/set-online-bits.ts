/* @layer bridge-wasm @kind logic */
import { AP_DEATH_LINK_BIT, AP_ONLINE_BIT, gateWord5State } from '@rotp/randomizer';
import { writeGateWord5 } from './write-gate-word-5';

const setOnlineBits = (bits: number): void => {
  const next = bits & (AP_ONLINE_BIT | AP_DEATH_LINK_BIT);
  if (next === gateWord5State.onlineBits) return;
  gateWord5State.onlineBits = next;
  writeGateWord5();
};

export { setOnlineBits };
