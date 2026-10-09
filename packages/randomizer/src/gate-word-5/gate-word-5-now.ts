/* @layer bridge-wasm @kind logic */
import { gateWord5State } from './gate-word-5-state';

const gateWord5Now = (): number => {
  const { capacityHalf, storyHalf, onlineBits, quietBits } = gateWord5State;
  return (capacityHalf | storyHalf | onlineBits | quietBits) >>> 0;
};

export { gateWord5Now };
