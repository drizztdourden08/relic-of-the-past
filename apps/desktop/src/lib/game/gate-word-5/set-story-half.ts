/* @layer bridge-wasm @kind logic */
import { gateWord5State } from '@rotp/randomizer';
import { writeGateWord5 } from './write-gate-word-5';

const setStoryHalf = (bits: number): void => {
  gateWord5State.storyHalf = bits;
  writeGateWord5();
};

export { setStoryHalf };
